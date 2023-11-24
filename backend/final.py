import networkx as nx
from flask import Flask, request, jsonify, json
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


def get_user_input(durations):
    processed_constraints = []

    num_tasks = int(len(durations))

    for i in range(num_tasks):
        duration = durations[i]  # Get the duration from the constraints array

        if "-" in duration:
            try:
                min_duration, max_duration = map(int, duration.split("-"))

                if min_duration <= max_duration:
                    processed_constraints.append(
                        (i, i + 1, range(min_duration, max_duration + 1))
                    )
                else:
                    print(
                        f"Invalid duration range for task {i + 1}: {duration}. Please ensure the start of the range is less than or equal to the end."
                    )
            except ValueError:
                print(
                    f"Invalid range format for task {i + 1}: {duration}. Please enter in the correct format (e.g., '1-2')."
                )
        else:
            try:
                fixed_duration = int(duration)
                processed_constraints.append((i, i + 1, fixed_duration))
            except ValueError:
                print(
                    f"Invalid duration input for task {i + 1}: {duration}. Please enter an integer."
                )

    return processed_constraints, num_tasks


def convert_to_24_hour_format(time_str):
    """
    Converts a time string in the format "hh am/pm" to a 24-hour format.
    """
    time, period = time_str.split()
    hour = int(time)

    if period.lower() == "pm" and hour != 12:
        hour += 12
    elif period.lower() == "am" and hour == 12:
        hour = 0

    return hour


def format_constraints(constraints):
    formatted_constraints = []

    for constraint in constraints:
        task_i, task_j, duration = constraint

        if isinstance(duration, range):
            l = min(duration)
            u = max(duration)
            formatted_constraints.append(f"{l} <= t(x{task_j}) - t(x{task_i}) <= {u}")
        else:
            formatted_constraints.append(
                f"{duration} <= t(x{task_j}) - t(x{task_i}) <= {duration}"
            )
    return formatted_constraints


def build_graph(constraints, num_tasks, start_hour, end_hour):
    G = nx.DiGraph()

    G.add_node("x0")

    G.add_edge("x0", "x1", weight=start_hour)
    total_hours = end_hour - start_hour

    G.add_edge("x0", f"x{num_tasks}", weight=total_hours)

    for xi, xj, duration in constraints:
        if isinstance(duration, range):
            l = min(duration)
            u = max(duration)
        else:
            l = u = duration

        G.add_edge(f"x{xi}", f"x{xj}", weight=u)
        if not (f"x{xi}" == f"x{num_tasks}" and f"x{xj}" == "x0"):
            G.add_edge(f"x{xj}", f"x{xi}", weight=-l)

    return G


def bellman_ford(G, source):
    distances = {node: float("inf") for node in G.nodes()}
    predecessor = {node: None for node in G.nodes()}
    distances[source] = 0

    for _ in range(len(G.nodes()) - 1):
        for u, v, weight in G.edges(data="weight"):
            if distances[u] != float("inf") and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                predecessor[v] = u

    for u, v, weight in G.edges(data="weight"):
        if distances[u] != float("inf") and distances[u] + weight < distances[v]:
            cycle = [v, u]
            while predecessor[u] not in cycle:
                cycle.append(predecessor[u])
                u = predecessor[u]
            cycle.append(predecessor[u])
            print("Negative cycle detected: ", " -> ".join(cycle))
            return (
                None,
                None,
            )

    return distances, predecessor


def print_graph(G):
    print("\nGraph:")
    print("Nodes:", G.nodes())
    print("Edges:")
    for edge in G.edges(data=True):
        print(f"{edge[0]} -> {edge[1]} (weight: {edge[2]['weight']})")


def time_conversion(hour, start_hour):
    """Converts the hour to a 12-hour format with AM/PM."""
    adjusted_hour = (hour + start_hour) % 24
    if adjusted_hour == 0:
        return "12 AM"
    elif adjusted_hour < 12:
        return f"{adjusted_hour} AM"
    elif adjusted_hour == 12:
        return "12 PM"
    else:
        return f"{adjusted_hour - 12} PM"


def adjust_constraints(
    constraints, task_to_change, new_start_time, num_tasks, start_hour, end_hour
):
    """
    Adjusts the constraints when a task's start time is changed by the user.
    Only the constraints for the tasks that come after the fixed task are updated.
    """

    new_start_hour = convert_to_24_hour_format(new_start_time)
    updated_task_index = task_to_change
    new_constraints = []

    # Adjust constraints for the remaining tasks relative to the updated task
    for i, (task_i, task_j, duration) in enumerate(constraints):
        if task_i >= updated_task_index:
            # Reindex the tasks relative to the updated task
            new_task_i = task_i - updated_task_index
            new_task_j = task_j - updated_task_index
            new_constraints.append((new_task_i, new_task_j, duration))

    # Adjust the global constraint for the end of the day based on the new start time
    remaining_hours = end_hour - new_start_hour
    new_constraints.insert(
        0, (0, num_tasks - updated_task_index, range(0, remaining_hours + 1))
    )

    return new_constraints


@app.route("/visualize", methods=["POST"])
def visualize():
    data = request.json
    constraints, num_tasks = get_user_input(data["taskDuration"])

    while True:
        start_time_str = data["start"]
        end_time_str = data["end"]

        start_hour = convert_to_24_hour_format(start_time_str)
        end_hour = convert_to_24_hour_format(end_time_str)

        if start_hour < end_hour:
            break
        else:
            print(
                "Invalid time range! Please make sure the start time is earlier than the end time. Try again."
            )

    total_hours = end_hour - start_hour

    constraints.append((0, num_tasks, range(0, total_hours + 1)))

    print("\nConstraints:")
    formatted_constraints = format_constraints(constraints)
    for constraint in formatted_constraints:
        print(constraint)

    G = build_graph(constraints, num_tasks, start_hour, end_hour)

    # Run Bellman-Ford for earliest start times
    G_earliest = G.reverse(copy=True)
    print(print_graph(G))
    print("\nCalculating earliest start times...")
    result_earliest = bellman_ford(G_earliest, "x0")
    if result_earliest == (None, None):
        print("Negative cycle detected for earliest start times. No solution exists.")
        return 0
    else:
        distances_earliest, _ = result_earliest

    # Run Bellman-Ford for latest start times
    print("\nCalculating latest start times...")
    result_latest = bellman_ford(G, "x0")
    if result_latest == (None, None):
        print("Negative cycle detected for latest start times. No solution exists.")
        return 0
    else:
        distances_latest, _ = result_latest
    latest_start_times = []
    for node in sorted(distances_latest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        latest_start_times.append(
            f"{node}: {time_conversion(distances_latest[node], start_hour)}"
        )

    earliest_start_times = []
    for node in sorted(distances_earliest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        earliest_start_times.append(
            f"{node}: {time_conversion(-distances_earliest[node], start_hour)}"
        )

    total_duration_earliest_list = []
    for node in sorted(distances_earliest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        total_duration_earliest = -distances_earliest[
            node
        ]  # Use negative value for earliest start times
        total_duration_earliest_list.append(
            f"Total duration to {node} (Earliest): {total_duration_earliest} hour(s)"
        )

    total_duration_latest_list = []
    for node in sorted(distances_latest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        total_duration_latest = distances_latest[node]
        total_duration_latest_list.append(
            f"Total duration to {node} (Latest): {total_duration_latest} hour(s)"
        )

    edgeArr = []

    for edge in G.edges(data=True):
        edgeArr.append(f"{edge[0]} -> {edge[1]} (weight: {edge[2]['weight']})")

    fixed_constraints = []
    for item in constraints:
        if isinstance(item[2], range):
            # Convert range to list
            third_element = list(item[2])
        else:
            # Keep the integer as is, or place it inside a list if needed
            third_element = [item[2]]  # or just item[2], depending on your requirement

        # Reconstruct the tuple/list with the fixed third element
        fixed_item = (item[0], item[1], third_element)
        fixed_constraints.append(fixed_item)

    return jsonify(
        {
            "nodes": list(G.nodes()),
            "edges": edgeArr,
            "earlyTimes": earliest_start_times,
            "latestTimes": latest_start_times,
            "constraints": fixed_constraints,
            "shortestPathEarliest": total_duration_earliest_list,
            "shortestPathLatest": total_duration_latest_list,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)


# code for schedule
#     # Ask if the user wants to change anything
# while True:
#     change_schedule = (
#         input("Would you like to change any task in the schedule? (yes/no): ")
#         .strip()
#         .lower()
#     )

#     if change_schedule == "no":
#         break  # Exit the loop if the user doesn't want to change the schedule

#     print("\nAvailable time ranges for each task:")
#     for i in range(1, num_tasks + 1):
#         earliest_time = time_conversion(-distances_earliest[f"x{i}"], start_hour)
#         latest_time = time_conversion(distances_latest[f"x{i}"], start_hour)
#         print(f"Task {i}: {earliest_time} - {latest_time}")
#     task_to_change = int(
#         input("Which task number do you want to change? (Enter the task number): ")
#     )

#     # Update the last updated task
#     last_updated_task = task_to_change

#     # Ask for a new time within this range
#     new_time_str = input(
#         f"Enter the new start time for Task {task_to_change} (within the range above): "
#     )
#     new_time_hour = convert_to_24_hour_format(new_time_str)
#     constraints = adjust_constraints(
#         constraints, task_to_change, new_time_str, num_tasks, start_hour, end_hour
#     )
#     updated_task_index = task_to_change
#     # Rebuild the graph with updated constraints for the uncompleted tasks

#     G_updated = build_graph(
#         constraints,  # Only use constraints from updated tasks onwards
#         num_tasks - updated_task_index,  # Adjust the number of tasks accordingly
#         new_time_hour,
#         end_hour,
#     )

#     print(
#         "\nRecalculating times for subsequent tasks starting from the updated task..."
#     )

#     result_earliest_updated = bellman_ford(G_updated.reverse(copy=True), "x0")

#     result_latest_updated = bellman_ford(G_updated, "x0")

#     if result_earliest_updated == (None, None):
#         print(
#             "Negative cycle detected for earliest start times. No solution exists."
#         )
#         return 0
#     else:
#         distances_earliest_updated, _ = result_earliest_updated

#     print("\nCalculating latest start times...")
#     if result_latest_updated == (None, None):
#         print("Negative cycle detected for latest start times. No solution exists.")
#         return 0
#     else:
#         distances_latest_updated, _ = result_latest_updated

#     print("SHORTEST PATH COMPUTATIONS:")
#     print("\nTotal Duration of Shortest Paths for Earliest Start Times:")
#     for node in sorted(
#         distances_earliest_updated.keys(), key=lambda x: (len(x), x)
#     ):
#         if node == "x0":
#             continue
#         total_duration_earliest_updated = -distances_earliest_updated[
#             node
#         ]  # Use negative value for earliest start times
#         print(
#             f"Total duration to {node} (Earliest): {total_duration_earliest_updated} hour(s)"
#         )

#     print("\nTotal Duration of Shortest Paths for Latest Start Times:")
#     for node in sorted(distances_latest_updated.keys(), key=lambda x: (len(x), x)):
#         if node == "x0":
#             continue
#         total_duration_latest_updated = distances_latest_updated[node]
#         print(
#             f"Total duration to {node} (Latest): {total_duration_latest_updated} hour(s)"
#         )

#     # Print Latest Start Times
#     print("\nLatest start times:")
#     for node in sorted(distances_latest_updated.keys(), key=lambda x: (len(x), x)):
#         if node == "x0":
#             continue
#         print(
#             f"{node}: {time_conversion(distances_latest_updated[node], new_time_hour)}"
#         )

#     # Print Earliest Start Times
#     print("\nEarliest start times:")
#     for node in sorted(
#         distances_earliest_updated.keys(), key=lambda x: (len(x), x)
#     ):
#         if node == "x0":
#             continue
#         print(
#             f"{node}: {time_conversion(-distances_earliest_updated[node], new_time_hour)}"
#         )

#     start_hour = new_time_hour

#     distances_earliest = distances_earliest_updated
#     distances_latest = distances_latest_updated

#     num_tasks = num_tasks - task_to_change
