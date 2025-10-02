'use client'

import { Button } from '@rov/ui/components/button'
import { Calendar as CalendarComponent } from '@rov/ui/components/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Textarea } from '@rov/ui/components/textarea'
import { format, isToday } from 'date-fns'
import { Calendar, CheckSquare, Clock, Plus, StickyNote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NextEventWidget } from '@/components/widgets/next-event'
import { authClient } from '@/lib/auth-client'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  dueDate?: Date
}

interface Note {
  id: string
  content: string
  createdAt: Date
}

export default function SummaryPage() {
  const { data: session, isPending } = authClient.useSession()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newNote, setNewNote] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        dueDate: selectedDate
      }
      setTodos([...todos, todo])
      setNewTodo('')
    }
  }

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date()
      }
      setNotes([...notes, note])
      setNewNote('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const getTodaysTodos = () => {
    return todos.filter(
      (todo) => todo.dueDate && isToday(todo.dueDate) && !todo.completed
    )
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-gray-900">
              Good {(() => {
                const hour = currentTime.getHours()
                if (hour < 12) return 'Morning'
                if (hour < 18) return 'Afternoon'
                return 'Evening'
              })()}, {session?.user.name}
            </h1>
            <p className="text-gray-600">Here's what's happening today</p>
          </div>
        </div>

        {/* Date & Time Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Today's Date
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {format(currentTime, 'EEEE, MMMM do')}
              </div>
              <p className="text-muted-foreground text-xs">
                {format(currentTime, 'yyyy')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Current Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {format(currentTime, 'h:mm:ss a')}
              </div>
              <p className="text-muted-foreground text-xs">
                {format(currentTime, 'EEEE')}
              </p>
            </CardContent>
          </Card>

          <NextEventWidget />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Drag todos from the sidebar to schedule them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  className="rounded-md border"
                  mode="single"
                  onSelect={setSelectedDate}
                  selected={selectedDate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Todo Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5" />
                  Quick Todo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a todo..."
                    value={newTodo}
                  />
                  <Button onClick={addTodo} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Due:{' '}
                  {selectedDate
                    ? format(selectedDate, 'MMM do')
                    : 'No date selected'}
                </p>
              </CardContent>
            </Card>

            {/* Notes Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StickyNote className="mr-2 h-5 w-5" />
                  Quick Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Jot down a note..."
                  rows={3}
                  value={newNote}
                />
                <Button className="w-full" onClick={addNote} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Today's Todos */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Todos</CardTitle>
                <CardDescription>
                  {getTodaysTodos().length} items due today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getTodaysTodos().length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No todos for today!
                    </p>
                  ) : (
                    getTodaysTodos().map((todo) => (
                      <div
                        className="flex items-center space-x-2 rounded border p-2"
                        key={todo.id}
                      >
                        <input
                          checked={todo.completed}
                          className="rounded"
                          onChange={() => toggleTodo(todo.id)}
                          type="checkbox"
                        />
                        <span
                          className={`flex-1 text-sm ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                          {todo.text}
                        </span>
                        <Button
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTodo(todo.id)}
                          size="sm"
                          variant="ghost"
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
                <CardDescription>{notes.length} notes created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note) => (
                    <div
                      className="rounded border bg-gray-50 p-3"
                      key={note.id}
                    >
                      <p className="text-sm">{note.content}</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {format(note.createdAt, 'MMM do, h:mm a')}
                      </p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No notes yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
