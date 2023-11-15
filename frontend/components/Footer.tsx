import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { footerLinks } from '../constants/index'
import { link } from 'fs';

const Footer = () => {
    return (
        <footer className='flex flex-col text-black-100 mt-5 border-t border--100 bg-gray-100'>
            <div className='flex justify-start gap-5 sm:px-16 px-6 py-10'>
                {/* Logo and Description */}
                <div className='flex flex-col justify-start items-start gap-6'>
                    <div className="flex flex-row">
                        <Image
                            src='/calendarlogo.svg'
                            alt='CSP Scheduler logo'
                            width={70}
                            height={5}
                            className='object-contain'
                        />
                        <span className='font-bold text-xl font-serif ml-2 mt-4'>CSP Scheduler</span>
                    </div>
                    <p className='text-base text-gray-700 '>CSP Scheduler <br /> All rights reserved &copy;</p>
                </div>

                {/* Links */}
                <div className='footer__links flex '>
                    {footerLinks.map((linkSection) => (
                        <div key={linkSection.title} className='footer__link flex flex-col'>
                            <h3 className='font-bold'>{linkSection.title}</h3>
                            <div className='links'>
                                {linkSection.links.map((item, index) => (
                                    <a
                                        key={item.title}
                                        href={item.url}
                                        className={`text-gray-500 ${index !== 0 ? 'ml-5' : ''}`}>
                                        {item.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex justify-between items-center flex-wrap mt-10 border-t border-black-100 sm:px-16 px-6 py-10'>
                <p>@2023 CSP Scheduler. All rights reserved</p>
            </div>
        </footer>

    )
}

export default Footer
