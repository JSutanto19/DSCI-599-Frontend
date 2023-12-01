"use client"
import React from 'react';
import CustomButton from './CustomButton'
import Image from 'next/image';


const Hero = () => {
    const handleScroll = () => {
        const nextSection = document.getElementById("discover");

        if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="hero">
            <div className='flex-1 pt-36 padding-x'>
                <h1 className='hero__title'>
                    Master Your Time: Optimize Your Schedule for a More Productive, Balanced Life!
                </h1>
                <p className='hero__subtitle'>
                    Create a personalized schedule fit to your daily needs.
                </p>
                <CustomButton
                    title="Create Schedule"
                    containerStyles='bg-primary-blue text-white rounded-full mt-10'
                    handleClick={() => { handleScroll() }}
                />
                <div className="hero__image-container">
                    <div className='hero__image'>
                        <Image src="/schedule-hero-3.png" alt='hero' fill className='object-contain' />
                        <div className='hero__image-overlay' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
