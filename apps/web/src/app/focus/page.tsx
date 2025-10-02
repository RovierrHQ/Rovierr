'use client'

import { Button } from '@rov/ui/components/button'
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Globe,
  GripVertical,
  MessageSquare,
  Pause,
  Play,
  Search,
  X
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  space: 'education' | 'social' | 'career' | 'personal'
  priority: number
  estimatedTime: number
  completed: number // 0-100 percentage
  pdfUrl?: string
  tools?: string[] // Previously opened tools for this task
}

interface Tool {
  id: string
  name: string
  icon: React.ElementType
  component: React.ReactNode
}

const availableTools: Tool[] = [
  {
    id: 'web',
    name: 'Web Search',
    icon: Globe,
    component: (
      <div className="flex h-full flex-col bg-background">
        <div className="border-border border-b p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search the web..."
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground text-sm">
            Web search results will appear here
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'chatgpt',
    name: 'AI Chat',
    icon: MessageSquare,
    component: (
      <div className="flex h-full flex-col bg-background">
        <div className="border-border border-b p-4">
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-muted-foreground text-sm">
            Ask me anything to help with your task...
          </p>
        </div>
        <div className="border-border border-t p-4">
          <input
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Type your question..."
            type="text"
          />
        </div>
      </div>
    )
  },
  {
    id: 'matrix',
    name: 'Matrix Solver',
    icon: Calculator,
    component: (
      <div className="flex h-full flex-col bg-background p-4">
        <h3 className="mb-4 font-semibold text-foreground">
          Matrix Calculator
        </h3>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">
            Matrix operations and solver interface
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'notes',
    name: 'Quick Notes',
    icon: FileText,
    component: (
      <div className="flex h-full flex-col bg-background p-4">
        <h3 className="mb-4 font-semibold text-foreground">Notes</h3>
        <textarea
          className="flex-1 resize-none rounded-lg border border-border bg-muted/50 p-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Take notes here..."
        />
      </div>
    )
  }
]

export default function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Binary Tree Implementation',
      space: 'education',
      priority: 1,
      estimatedTime: 45,
      completed: 0,
      pdfUrl: '/binary-tree-assignment.jpg',
      tools: []
    },
    {
      id: '2',
      title: 'Review budget and expenses',
      space: 'personal',
      priority: 2,
      estimatedTime: 20,
      completed: 0,
      pdfUrl: '/budget-spreadsheet.jpg',
      tools: []
    },
    {
      id: '3',
      title: 'Update resume for internship',
      space: 'career',
      priority: 3,
      estimatedTime: 30,
      completed: 0,
      pdfUrl: '/modern-resume-template.png',
      tools: []
    }
  ])

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [timerExpanded, setTimerExpanded] = useState(false)
  const [openTools, setOpenTools] = useState<string[]>([])
  const [activeToolId, setActiveToolId] = useState<string | null>(null)
  const [showToolPalette, setShowToolPalette] = useState(false)
  const [toolSearch, setToolSearch] = useState('')
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false)
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null)

  const currentTask = tasks[currentTaskIndex]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeRemaining])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setShowToolPalette(true)
        }
      }
      if (e.key === 'Escape') {
        setShowToolPalette(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOpenTool = (toolId: string) => {
    if (!openTools.includes(toolId)) {
      setOpenTools([...openTools, toolId])
    }
    setActiveToolId(toolId)
    setShowToolPalette(false)
    setToolSearch('')
  }

  const handleCloseTool = (toolId: string) => {
    setOpenTools(openTools.filter((id) => id !== toolId))
    if (activeToolId === toolId) {
      setActiveToolId(openTools[0] || null)
    }
  }

  const handleTaskComplete = (percentage: number) => {
    const updatedTasks = [...tasks]
    updatedTasks[currentTaskIndex].completed = percentage
    setTasks(updatedTasks)
  }

  const handleSwitchTask = (index: number) => {
    setCurrentTaskIndex(index)
    setTaskSidebarOpen(false)
    // Restore tools for this task
    const task = tasks[index]
    if (task.tools && task.tools.length > 0) {
      setOpenTools(task.tools)
      setActiveToolId(task.tools[0])
    } else {
      setOpenTools([])
      setActiveToolId(null)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedTaskIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedTaskIndex === null || draggedTaskIndex === index) return

    const updatedTasks = [...tasks]
    const draggedTask = updatedTasks[draggedTaskIndex]
    updatedTasks.splice(draggedTaskIndex, 1)
    updatedTasks.splice(index, 0, draggedTask)

    setTasks(updatedTasks)
    setDraggedTaskIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedTaskIndex(null)
  }

  const filteredTools = availableTools.filter((tool) =>
    tool.name.toLowerCase().includes(toolSearch.toLowerCase())
  )

  const activeTool = availableTools.find((tool) => tool.id === activeToolId)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div className="absolute top-0 right-0 left-0 z-50 border-border/50 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              type="button"
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <div className="font-semibold text-foreground text-lg tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="flex-1 px-8">
            <div className="text-center">
              <p className="text-balance font-medium text-foreground text-sm">
                {currentTask.title}
              </p>
            </div>
          </div>

          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted"
            onClick={() => setTimerExpanded(!timerExpanded)}
            type="button"
          >
            {timerExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {timerExpanded && (
          <div className="border-border/50 border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setTimeRemaining(25 * 60)}
                size="sm"
                variant="outline"
              >
                25 min
              </Button>
              <Button
                onClick={() => setTimeRemaining(15 * 60)}
                size="sm"
                variant="outline"
              >
                15 min
              </Button>
              <Button
                onClick={() => setTimeRemaining(5 * 60)}
                size="sm"
                variant="outline"
              >
                5 min
              </Button>
              <div className="mx-4 h-4 w-px bg-border" />
              <Button
                onClick={() => handleTaskComplete(50)}
                size="sm"
                variant="outline"
              >
                50% Done
              </Button>
              <Button
                onClick={() => handleTaskComplete(100)}
                size="sm"
                variant="outline"
              >
                Complete
              </Button>
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute top-14 left-0 z-40 h-[calc(100vh-3.5rem)]"
        onMouseEnter={() => setTaskSidebarOpen(true)}
        onMouseLeave={() => setTaskSidebarOpen(false)}
      >
        <div
          className={`h-full border-border border-r bg-background/95 backdrop-blur-sm transition-all duration-300 ${
            taskSidebarOpen ? 'w-80' : 'w-12'
          }`}
        >
          {taskSidebarOpen ? (
            <div className="flex h-full flex-col p-4">
              <h3 className="mb-4 font-semibold text-foreground text-sm">
                Tasks
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div
                    className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                      index === currentTaskIndex
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    draggable
                    key={task.id}
                    onClick={() => handleSwitchTask(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragStart={() => handleDragStart(index)}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {task.title}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${task.completed}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {task.completed}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 top-14 flex">
        {/* Left: Tool tabs (when multiple tools open) */}
        {openTools.length > 0 && (
          <div className="flex w-12 flex-col gap-2 border-border border-r bg-muted/30 p-2">
            {openTools.map((toolId) => {
              const tool = availableTools.find((t) => t.id === toolId)
              if (!tool) return null
              const Icon = tool.icon
              return (
                <button
                  className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                    activeToolId === toolId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                  key={toolId}
                  onClick={() => setActiveToolId(toolId)}
                  type="button"
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
          </div>
        )}

        {/* Center/Left: PDF Viewer */}
        <div
          className={`flex-1 ${activeToolId ? 'border-border border-r' : ''}`}
        >
          <div className="flex h-full items-center justify-center bg-muted/20 p-8">
            <div className="h-full w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              <img
                alt="Task document"
                className="h-full w-full object-contain"
                src={currentTask.pdfUrl || '/placeholder.svg'}
              />
            </div>
          </div>
        </div>

        {/* Right: Active Tool */}
        {activeToolId && activeTool && (
          <div className="relative w-[45%] border-border border-l bg-background">
            <div className="absolute top-2 right-2 z-10">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => handleCloseTool(activeToolId)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-full">{activeTool.component}</div>
          </div>
        )}
      </div>

      {showToolPalette && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-background/80 pt-32 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
            <div className="border-border border-b p-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  onChange={(e) => setToolSearch(e.target.value)}
                  placeholder="Search tools... (web, chatgpt, matrix, notes)"
                  type="text"
                  value={toolSearch}
                />
                <kbd className="rounded bg-muted px-2 py-1 text-muted-foreground text-xs">
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    key={tool.id}
                    onClick={() => handleOpenTool(tool.id)}
                    type="button"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {tool.name}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="border-border border-t bg-muted/30 p-3 text-center">
              <p className="text-muted-foreground text-xs">
                Press T to open tool palette anytime
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
