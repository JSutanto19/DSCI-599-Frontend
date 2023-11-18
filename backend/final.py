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


def convert_third_to_range(data):
    converted_data = []

    for item in data:
        if isinstance(item, (tuple, list)) and len(item) > 2:
            third_element = item[2]

            # Check if third element is a list
            if isinstance(third_element, list):
                if len(third_element) == 1:
                    # If it's a single-element list, use the element directly
                    third_element = third_element[0]
                else:
                    # If it's a multi-element list, convert to range
                    third_element = range(third_element[0], third_element[-1] + 1)
            elif not isinstance(third_element, range):
                # If it's a single integer (or other non-list, non-range), keep as is
                third_element = third_element

            if isinstance(item, list):
                # If item is a list, concatenate using list
                new_item = item[:2] + [third_element]
            else:
                # If item is a tuple, concatenate using tuple
                new_item = item[:2] + (third_element,)

            converted_data.append(new_item)
        else:
            converted_data.append(item)

    return converted_data


def build_graph(constraints, num_tasks, start_hour, end_hour):
    G = nx.DiGraph()

    G.add_node("x0")
    total_hours = end_hour - start_hour
    print("converted ", constraints)
    # Iterate through each constraint
    for xi, xj, duration in constraints:
        # print(f"riten is a python guy{min(duration)}")
        if isinstance(duration, range):
            l = min(duration)
            u = max(duration)
        else:
            l = u = duration

        # Add forward edge
        G.add_edge(f"x{xi}", f"x{xj}", weight=u)

        # Add backward edge only if it's not the global constraint
        if xi != 0 or xj != num_tasks:
            print(l)
            G.add_edge(f"x{xj}", f"x{xi}", weight=-l)

    # Add a special edge for the global constraint
    G.add_edge("x0", f"x{num_tasks}", weight=total_hours)

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
    # print(end_hour)
    # print(type(num_tasks))

    new_start_hour = convert_to_24_hour_format(new_start_time) - start_hour
    new_constraints = []

    for i, (task_i, task_j, duration) in enumerate(constraints):
        if task_i == task_to_change - 1:
            new_constraints.append(
                (task_i, task_j, range(new_start_hour, new_start_hour + 1))
            )
        elif task_i < task_to_change - 1:
            new_constraints.append(constraints[i])
        else:  # This part ensures that all subsequent tasks are also updated
            new_constraints.append((task_i, task_j, duration))

    # This adds the global constraint back into the constraints list
    new_constraints.append((0, num_tasks, range(0, end_hour - start_hour + 1)))

    return new_constraints


# This is the corrected adjust_constraints function
# Now I will integrate this function back into the main program and run it to ensure it works correctly.


@app.route("/visualize", methods=["POST"])
def visualize():
    data = request.json
    constraints, num_tasks = get_user_input(data["taskDuration"])
    last_updated_task = 0
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
    print(print_graph(G))

    # Run Bellman-Ford for earliest start times
    G_earliest = G.reverse(copy=True)
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

    # Display schedules
    earlyTimes = []

    for node in sorted(distances_earliest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        earlyTimes.append(time_conversion(-distances_earliest[node], start_hour))

    latestTimes = []
    for node in sorted(distances_latest.keys(), key=lambda x: (len(x), x)):
        if node == "x0":
            continue
        latestTimes.append(time_conversion(distances_latest[node], start_hour))

    edgeArr = []

    for edge in G.edges(data=True):
        edgeArr.append(f"{edge[0]} -> {edge[1]} (weight: {edge[2]['weight']})")

    # json_serializable_array = [
    #     [item[0], item[1], list(item[2])] for item in constraints
    # ]
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
            "earlyTimes": earlyTimes,
            "latestTimes": latestTimes,
            "constraints": fixed_constraints,
        }
    )


def reverse_time_conversion(time_str, start_hour):
    """Converts a 12-hour time format with AM/PM back to an hour relative to start_hour."""
    # Split the time string into its components (hour and period)
    parts = time_str.split()
    hour = int(parts[0])
    period = parts[1]

    # Convert back to 24-hour format
    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0

    # Adjust for start_hour and convert back to original format
    return (hour - start_hour) % 24


@app.route("/schedule", methods=["POST"])
def schedule():
    data = request.json
    last_updated_task = 0
    num_tasks = len(data["earlyTimes"])
    start_hour = data["start_hour"]
    end_hour = data["end_hour"]

    early_times = data["earlyTimes"]

    # Convert the string array to a dictionary with error checking
    resulting_dict = {}
    for item in early_times:
        parts = item.split(": ")
        if len(parts) >= 2:
            key = parts[0]
            value = parts[1]
            resulting_dict[key] = value
        else:
            print(f"Skipping invalid format: {item}")

    # Assuming you have the original order of nodes stored
    original_nodes = sorted(
        [node for node in resulting_dict.keys() if node != "x0"],
        key=lambda x: (len(x), x),
    )

    # Map the earlyTimes back to a dictionary
    original_earliest_dict = {
        node: reverse_time_conversion(time, start_hour)
        for node, time in zip(original_nodes, data["earlyTimes"])
    }

    # Assuming you also have the latestTimes array
    original_latest_dict = {
        node: reverse_time_conversion(time, start_hour)
        for node, time in zip(original_nodes, data["latestTimes"])
    }

    original_earliest_times = {
        node: -original_earliest_dict[node] for node in original_earliest_dict
    }
    original_latest_times = {
        node: original_latest_dict[node] for node in original_latest_dict
    }

    # Ask which task to change, ensuring it's not a completed task
    task_to_change = data["task_index"]
    print("hello", data["task_index"])

    if task_to_change <= last_updated_task:
        print(
            f"Task {task_to_change} has already been started or completed and cannot be changed."
        )
        return

    last_updated_task = task_to_change
    # start_hour = int(start_hour.split()[0])
    prev_start = convert_to_24_hour_format(data["start_hour1"])
    end_hour = convert_to_24_hour_format(end_hour)

    # Since the start time for a task has changed, we need to update the constraints and graph
    constraints = adjust_constraints(
        data["constraints"],
        task_to_change,
        start_hour,
        num_tasks,
        prev_start,
        end_hour,
    )
    # print(format_constraints(constraints))
    print(constraints)
    updated_task_index = task_to_change - 1
    # Rebuild the graph with updated constraints for the uncompleted tasks

    print("param 1 ", num_tasks - updated_task_index)
    print("param 2 other ", data["prev_start"])
    print("param 2 ", data["start_hour1"])
    print("param 3", end_hour)

    constraints = convert_third_to_range(constraints)
    print(format_constraints(constraints))

    print("param 4", constraints[updated_task_index:])

    G_updated = build_graph(
        constraints[
            updated_task_index:
        ],  # Only use constraints from updated tasks onwards
        num_tasks - updated_task_index,  # Adjust the number of tasks accordingly
        prev_start,
        end_hour,
    )
    # Run Bellman-Ford from the updated task considered as the new 'x0'
    print(
        "\nRecalculating times for subsequent tasks starting from the updated task..."
    )
    result_earliest_updated = bellman_ford(
        G_updated.reverse(copy=True), f"x{updated_task_index}"
    )
    result_latest_updated = bellman_ford(G_updated, f"x{updated_task_index}")

    # Check for negative cycles in the updated graph
    if result_earliest_updated[0] is None or result_latest_updated[0] is None:
        print("Negative cycle detected after updating the task. No solution exists.")
        return 0

    distances_earliest_updated, _ = result_earliest_updated
    distances_latest_updated, _ = result_latest_updated

    original_earliest_times = {
        node: -dist for node, dist in result_earliest_updated[0].items() if node != "x0"
    }
    original_latest_times = {
        node: dist for node, dist in result_latest_updated[0].items() if node != "x0"
    }

    # Initialize empty arrays

    updated_earliest_start_times = []
    updated_latest_start_times = []

    print("410 ", start_hour)

    # Loop through tasks for earliest start times
    for i in range(last_updated_task, num_tasks + 1):
        node = f"x{i}"
        updated_earliest_start_times.append(
            time_conversion(
                original_earliest_times.get(node, "Unavailable"), prev_start
            )
        )

    # Loop through tasks for latest start times
    for i in range(last_updated_task, num_tasks + 1):
        node = f"x{i}"

        updated_latest_start_times.append(
            time_conversion(original_latest_times.get(node, "Unavailable"), prev_start)
        )

    print("Schedule update complete.")

    print(print_graph(G_updated))

    edgeArr = []

    for edge in G_updated.edges(data=True):
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
    # return nodes, edges, earliest start times, latest start times
    return jsonify(
        {
            "earlyTimes": updated_earliest_start_times,
            "latestTimes": updated_latest_start_times,
            "nodes": list(G_updated.nodes()),
            "edges": edgeArr,
            "constraints": fixed_constraints,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
