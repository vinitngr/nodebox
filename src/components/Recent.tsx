import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import recentData from '@/data/recentData'
import { Link } from 'lucide-react'
import { cn } from '@/lib/utils'
function Recent() {
  return (
    <div>
      <div className="flex items-start mb-12">
        <div className="text-xs text-gray-500 mr-12 mt-2">
          COMMUNITY
          WORK
          <br />
          SHOWCASE
        </div>
        <h2 className="text-4xl lg:text-4xl font-light">Recent Uploads</h2>
      </div>
      <div className="overflow-x-auto">

        <Table>
          <TableCaption>A list of your recent Uploads.</TableCaption>
          <TableHeader>
            <TableRow>
              {
              Object.keys(recentData[0]).map((key, idx) => (
                <TableHead key={idx} className={cn("w-[100px]")}>
                  {key !== 'url' ? key : ''}
                </TableHead>
              ))
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentData.map((invoice , index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{invoice.username}</TableCell>
                <TableCell>{invoice.uploadDate}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                
                <TableCell className="flex justify-end">
                  <a href={invoice.url} target='_blank'><Link color='blue' size={15}/></a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total Project Uploaded till now</TableCell>
              <TableCell className="text-right">120</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>

  )
}

export default Recent
