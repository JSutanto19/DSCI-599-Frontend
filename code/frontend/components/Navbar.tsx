import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
    return (
        <header className='w-full absolute z-10'>
            <nav className='mx-auto flex justify-between items-center sm:px-16 px-6 py-4'>
                <Link href='/' className='flex justify-center items-center'>
                    <Image
                        src='/calendarlogo.svg'
                        alt='CSP Scehduler logo'
                        width={70}
                        height={5}
                        className='object-contain'
                    />
                    <text className='font-bold text-xl font-serif ml-2'>CSP Scheduler</text>


                </Link>

            </nav>

        </header>
    )
}

export default Navbar
