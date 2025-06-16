const recentData : RecentItem[] = [
  {
    username: "John Doe",
    uploadDate: "2022-01-01",
    description: "This is a sample invoice",
    url: "https://example.com/invoice/INV001",
  },
  {
    username: "Jane Doe",
    uploadDate: "2022-01-05",
    description: "This is another sample invoice",
    url: "https://example.com/invoice/INV002",
  },
  {
    username: "Bob Smith",
    uploadDate: "2022-01-10",
    description: "This is a third sample invoice",
    url: "https://example.com/invoice/INV003",
  },
  {
    username: "Alice Johnson",
    uploadDate: "2022-01-15",
    description: "This is a fourth sample invoice",
    url: "https://example.com/invoice/INV004",
  },
  {
    username: "Mike Brown",
    uploadDate: "2022-01-20",
    description: "This is a fifth sample invoice",
    url: "https://example.com/invoice/INV005",
  },
  {
    username: "Sarah Lee",
    uploadDate: "2022-01-25",
    description: "This is a sixth sample invoice",
    url: "https://example.com/invoice/INV006",
  },
  {
    username: "Emily Chen",
    uploadDate: "2022-01-30",
    description: "This is a seventh sample invoice",
    url: "https://example.com/invoice/INV007",
  },
]
type RecentItem = {
  username: string;
  uploadDate: string;
  description: string;
  url: string;
};


export default recentData

