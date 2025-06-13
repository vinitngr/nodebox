import React from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
function Upload() {
    return (
        <>
            <div className="grid grid-cols-1 bg-gray-200 p-5 mb-16 rounded-2xl lg:grid-cols-3 gap-12 items-start pb-12">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-light leading-tight mb-4">
                        Upload your Project Here<br />
                        <span className="text-gray-400">easy upload</span>
                    </h2>

                    {/* <div className='w-full min-h-36 p-2'
                     style={{ border : '2px dashed yellow' , borderSpacing: '100px' }}>
                    Error display</div> */}
                </div>
                <div className="space-y-6 col-span-2">
                    <p className="text-sm leading-relaxed text-gray-700">
                        Upload valid github url or project folder to host your React.js web app. <br />
                        <span className="text-yellow-500">Note:</span> Make sure your project is a React.js app and has a valid build script in package.json.
                        <br />
                    </p>


                    <Separator className="my-4" />
                    
                    <div className="grid flex-1 items-center gap-3">
                        <Label htmlFor="picture">Project Name</Label>
                        <Input id="picture" type="text" placeholder='Project Name' maxLength={20} />
                    </div>
                    
                    <Separator className="my-4" />


                    <div id='forInput' className='flex gap-5 items-center  justify-center'>
                        <div className="grid flex-1 items-center gap-3">
                            <Label htmlFor="picture">GitHub Url</Label>
                            <Input id="picture" placeholder='Git URL' type="url" />
                        </div>
                        Or
                        {/* <div className="flex items-center my-1">
                            <div className="flex-grow border-t border-gray-300" />
                            <span className="mx-4 text-sm text-muted-foreground">OR</span>
                            <div className="flex-grow border-t border-gray-300" />
                        </div> */}
                        <div className="grid flex-1 items-center gap-3">
                            <Label htmlFor="filefolder">Project Folder</Label>
                            <Input id="filefolder" type="file" multiple  //not working only 
                            />
                        </div>
                    </div>

                    <Separator className='my-4'/>
                    <div className="grid flex-1 items-center gap-3">
                        <Label htmlFor="picture">Discription</Label>
                        <Textarea placeholder='Add discription About project' id="description" className='h-20 max-h-28'/>
                    </div>
                    <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 mt-4 self-start">Upload</Button>
                </div>
            </div>
        </>
    )
}

export default Upload