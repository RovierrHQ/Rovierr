export const mockContacts = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: '/diverse-students-studying.png',
    major: 'Computer Science',
    year: 'Year 3',
    email: 'sarah.chen@rovierr.edu',
    phone: '+1 (555) 123-4567',
    type: 'friend',
    sharedSchedule: [
      {
        day: 'Monday',
        time: '9:00 AM - 10:30 AM',
        course: 'CS3230 - Algorithms',
        room: 'Tech Lab 3'
      },
      {
        day: 'Wednesday',
        time: '2:00 PM - 3:30 PM',
        course: 'CS4101 - AI Systems',
        room: 'Tech Lab 5'
      }
    ]
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    avatar: '/diverse-students-studying.png',
    major: 'Business Administration',
    year: 'Year 2',
    email: 'marcus.j@rovierr.edu',
    phone: '+1 (555) 234-5678',
    type: 'classmate',
    sharedSchedule: [
      {
        day: 'Tuesday',
        time: '11:00 AM - 12:30 PM',
        course: 'ECON2301 - Microeconomics',
        room: 'Business Hall 201'
      }
    ]
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: '/diverse-students-studying.png',
    major: 'Business Administration',
    year: 'Year 2',
    email: 'emma.w@rovierr.edu',
    phone: '+1 (555) 345-6789',
    type: 'groupmate',
    sharedSchedule: [
      {
        day: 'Thursday',
        time: '3:00 PM - 4:30 PM',
        course: 'BUS2201 - Marketing',
        room: 'Business Hall 105'
      }
    ]
  },
  {
    id: 4,
    name: 'Alex Kim',
    avatar: '/diverse-students-studying.png',
    major: 'Computer Science',
    year: 'Year 3',
    email: 'alex.kim@rovierr.edu',
    phone: '+1 (555) 456-7890',
    type: 'classmate',
    sharedSchedule: [
      {
        day: 'Monday',
        time: '9:00 AM - 10:30 AM',
        course: 'CS3230 - Algorithms',
        room: 'Tech Lab 3'
      },
      {
        day: 'Friday',
        time: '1:00 PM - 2:30 PM',
        course: 'CS3401 - Database Systems',
        room: 'Tech Lab 2'
      }
    ]
  }
]

export const mockPeople = [
  {
    id: 5,
    name: 'James Lee',
    avatar: '/diverse-students-studying.png',
    major: 'Mechanical Engineering',
    year: 'Year 4',
    bio: 'Passionate about robotics and automation. Looking to connect with fellow engineers and tech enthusiasts.',
    mutualConnections: 12,
    clubs: ['Tech Innovators', 'Robotics Club'],
    interests: ['AI', 'Robotics', '3D Printing']
  },
  {
    id: 6,
    name: 'Sofia Martinez',
    avatar: '/diverse-students-studying.png',
    major: 'Graphic Design',
    year: 'Year 2',
    bio: 'Creative designer with a love for branding and visual storytelling. Always open to collaboration!',
    mutualConnections: 8,
    clubs: ['Photography Club', 'Design Society'],
    interests: ['Design', 'Photography', 'Art']
  },
  {
    id: 7,
    name: 'David Park',
    avatar: '/diverse-students-studying.png',
    major: 'Business Analytics',
    year: 'Year 3',
    bio: "Data enthusiast exploring the intersection of business and technology. Let's connect!",
    mutualConnections: 15,
    clubs: ['Business Club', 'Data Science Society'],
    interests: ['Analytics', 'Business', 'Tech']
  },
  {
    id: 8,
    name: 'Olivia Brown',
    avatar: '/diverse-students-studying.png',
    major: 'Psychology',
    year: 'Year 1',
    bio: 'New to campus and excited to meet people! Interested in mental health advocacy and research.',
    mutualConnections: 3,
    clubs: ['Psychology Society'],
    interests: ['Psychology', 'Research', 'Wellness']
  }
]

export const mockPosts = [
  {
    id: 1,
    author: {
      name: 'Sarah Chen',
      avatar: '/diverse-students-studying.png',
      role: 'Computer Science, Year 3'
    },
    content:
      "Just finished our hackathon project! 🎉 Our team built an AI-powered study buddy app. Can't wait to present tomorrow!",
    image: '/hackathon-event.png',
    likes: 42,
    comments: 8,
    timestamp: '2 hours ago',
    type: 'post'
  },
  {
    id: 2,
    author: {
      name: 'Photography Club',
      avatar: '/vintage-camera-still-life.png',
      role: 'Official Club'
    },
    content:
      '📸 Golden Hour Photo Walk this Saturday at 5 PM! Meet at the main campus entrance. All skill levels welcome!',
    likes: 67,
    comments: 15,
    timestamp: '5 hours ago',
    type: 'event',
    eventDetails: {
      date: 'Saturday, Nov 9',
      time: '5:00 PM',
      location: 'Main Campus Entrance'
    }
  },
  {
    id: 3,
    author: {
      name: 'Marcus Johnson',
      avatar: '/diverse-students-studying.png',
      role: 'Business Admin, Year 2'
    },
    content: 'Looking for study partners for ECON2301 final! Coffee on me ☕',
    likes: 23,
    comments: 12,
    timestamp: '1 day ago',
    type: 'post'
  }
]

export const mockClubs = [
  { name: 'Photography Club', members: 234, category: 'Arts', icon: '📸' },
  { name: 'Tech Innovators', members: 456, category: 'Technology', icon: '💻' },
  { name: 'Debate Society', members: 189, category: 'Academic', icon: '🎤' },
  { name: 'Dance Crew', members: 312, category: 'Performance', icon: '💃' },
  { name: 'Robotics Club', members: 145, category: 'Technology', icon: '🤖' },
  { name: 'Business Club', members: 278, category: 'Professional', icon: '💼' }
]

export const mockEvents = [
  {
    title: 'Career Fair 2024',
    date: 'Nov 15',
    time: '10:00 AM',
    location: 'Student Center',
    attendees: 234
  },
  {
    title: 'Music Festival',
    date: 'Nov 20',
    time: '6:00 PM',
    location: 'Campus Grounds',
    attendees: 567
  },
  {
    title: 'AI Workshop',
    date: 'Nov 12',
    time: '2:00 PM',
    location: 'Tech Lab 3',
    attendees: 89
  }
]
