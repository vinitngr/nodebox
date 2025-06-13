import React from 'react'
import { Button } from './ui/button'
import { Ghost, Link } from 'lucide-react'

function Recent() {
  return (
    <div className="overflow-x-auto">
  <table className="min-w-full table-fixed divide-y-2 divide-gray-200 dark:divide-gray-700">
    <thead className="ltr:text-left rtl:text-right">
      <tr className="*:font-medium *:text-gray-900 dark:*:text-white">
        <th className="px-3 py-2 w-[100px]">Username</th>
        <th className="px-3 py-2 w-[100px]">Uploaded</th>
        <th className="px-3 py-2 text-center w-[50%]">Description</th>
        <th className="px-3 py-2 w-[60px]"></th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200 *:even:bg-gray-50 dark:divide-gray-700 dark:*:even:bg-gray-800">
      {Array.from({ length: 4 }).map((_, index) => (
        <tr className="*:text-gray-900 *:first:font-medium dark:*:text-white" key={index}>
          <td className="px-3 py-2">@nandor</td>
          <td className="px-3 py-2">04/06/1262</td>
          <td className="px-3 line-clamp-2 py-1 break-words">This Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi fuga aperiam nulla quod at eum, placeat culpa. Ullam unde odio, quae, voluptate totam iure natus itaque, eius libero minima architecto? is a react based simple portfolio which lorem i made years ago and now hosting it on my own server.</td>
          <td className="text-center">
            <a href="https://vampirewarrior.hostthrough.com" target="_blank" rel="noreferrer">
              <Button variant="ghost" className="p-2">
                <Link className="h-4 w-4" />
              </Button>
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  )
}

export default Recent
