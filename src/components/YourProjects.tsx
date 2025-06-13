'use client'
import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import ButtonGroup from './ui/ButtonGroup'
function YourProjects() {
    return (
        <div className='relative'>
            <div className="flex items-start mb-12">
                <div className="text-xs text-gray-500 mr-12 mt-2">
                    WORK
                    <br />
                    SHOWCASE
                </div>
                <h2 className="text-4xl lg:text-4xl font-light">Your Projects</h2>
            </div>
            <div>
                <Carousel
                    opts={{
                        align: "start",
                    }}
                >
                    <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                                <div className="p-1">
                                    <div className="group cursor-pointer">
                                        <div
                                            className="group relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-center bg-cover"
                                            style={{
                                                backgroundImage: "url('https://picsum.photos/800/600')",
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition duration-300 z-0" />

                                            <div className="absolute z-10 right-[50%] top-[50%] translate-x-[50%] translate-y-[-50%] hidden group-hover:flex items-center justify-center gap-2 transition duration-300">
                                                <ButtonGroup/>
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <h3 className="text-lg font-medium">vinitngr-portfolio</h3>
                                            <p className="text-sm font-light">12-May</p>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselNext className='-translate-x-15 absolute -top-5 border' />
                </Carousel>
            </div>
        </div>
    )
}

export default YourProjects