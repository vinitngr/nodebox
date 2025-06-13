import About from "@/components/About";
import Recent from "@/components/Recent";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import YourProjects from "@/components/YourProjects";
import Upload from "@/components/Upload";
import { Barrio, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
const barrio = Barrio({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export default function Home() {
  return (
    <div className="min-h-screen px-2 sm:px-6 fade-in-up font-sans">

      <header className="flex items-center rounded-xl shadow  mt-2 justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center">
          <div className={` text-2xl font-normal tracking-tight`}>
            Host
            <br />
            - Through
          </div>
        </div>

        <nav className="hidden md:flex font-bold gap-15">
          <Link href="#" className="text-sm hover:text-gray-600 transition-colors">
            Home
          </Link>
          <Link href="#" className="text-sm hover:text-gray-600 transition-colors">
            Host
          </Link>
          <Link href="#" className="text-sm hover:text-gray-600 transition-colors">
            Recent Host
          </Link>
          <Link href="#" className="text-sm hover:text-gray-600 transition-colors">
            Portfolio
          </Link>
          <Link href="#" className="text-sm hover:text-gray-600 transition-colors">
            Footer
          </Link>
        </nav>

        <Button className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-none">SignUp</Button>
      </header>

        {/* <div className="w-1/6 hidden lg:block"><About /></div> */}
      <div className="w-full py-4">
        <div className="px-6 lg:px-12 py-12   text-gray-100 rounded-xl "
                style={{
          backgroundImage: `url('/grad.avif'), url('/noise.webp')`,
          backgroundBlendMode: 'overlay, normal',
          backgroundSize: 'cover, auto',
          filter: 'brightness(1.0)',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundPosition: 'center, center',
        }}
        >
          <div className="flex flex-col items-center text-center h-[68vh]">
            <div className="mt-10">
              <h1 className="text-4xl lg:text-6xl font-light leading-tight mb-8" >
                <span  className={cn('font-bold decoration-2 underline-offset-4 lg:text-6xl  p-1' , barrio.className)}>HostThrough</span> lets you
                <br />
                Host your React.js WebApp <span className="underline decoration-2 decoration-white underline-offset-4">Real quick</span>
                <br />
                Using <span className="text-orange-400">WebContainer<sup className="text-xs align-super m-2 text-white">by stackblitz</sup></span>
              </h1>
            </div>

            <div className="mt-4 flex gap-8">
              <a href="#upload-S" className="scroll-smooth bg-black/30  flex items-center rounded-full gap-2 border border-orange-400 p-3 text-white font-light text-xl hover:bg-orange-500 transition">
                Click here to get started
                <ArrowDown className="animate-bounce text-white translate-y-1" />
              </a>
              <a className={cn("flex items-center rounded-full gap-2 bg-orange-400 p-3 text-white text-xl", "hover:bg-orange-500 transition-colors px-8")}>
                Sign UP
              </a>
            </div>
          </div>
        </div>

        <div className="flex my-2">
          <div className="w-1/3  mt-30 hidden lg:block">
            <About />
          </div>
          <div className="w-full">
            <div className="pt-6" id="upload-S">
              <Upload />
            </div>
            <div className="mb-20">
              <YourProjects />
            </div>
            <div className="mt-20">
              <div className="flex items-start mb-12">
                <div className="text-xs text-gray-500 mr-12 mt-2">
                  COMMUNITY
                  WORK
                  <br />
                  SHOWCASE
                </div>
                <h2 className="text-4xl lg:text-4xl font-light">Recent Uploads</h2>
              </div>
              <Recent />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}