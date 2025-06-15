"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface QuestionCardProps {
  question: {
    id: number
    question_text: string
    question_type: string
    media_url?: string
    options: string[]
    correct_option?: number
  }
  onAnswer: (questionId: number, answer: number) => void
  showCorrect?: boolean
  userAnswer?: number
}

export function QuestionCard({ question, onAnswer, showCorrect, userAnswer }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(userAnswer)

  const handleOptionChange = (value: string) => {
    const optionIndex = parseInt(value)
    setSelectedOption(optionIndex)
    onAnswer(question.id, optionIndex)
  }

  const getOptionStyle = (index: number) => {
    if (!showCorrect) return ""
    
    if (question.correct_option === index) {
      return "text-green-600 dark:text-green-400"
    }
    if (selectedOption === index && selectedOption !== question.correct_option) {
      return "text-red-600 dark:text-red-400"
    }
    return ""
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {question.question_text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.media_url && (
          <div className="mb-4">
            {question.question_type === "image" && (
              <img
                src={question.media_url}
                alt="Question media"
                className="max-w-full h-auto rounded-md"
              />
            )}
            {question.question_type === "video" && (
              <video
                src={question.media_url}
                controls
                className="max-w-full rounded-md"
              />
            )}
            {question.question_type === "audio" && (
              <audio
                src={question.media_url}
                controls
                className="w-full"
              />
            )}
          </div>
        )}
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={handleOptionChange}
          disabled={showCorrect}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${question.id}-${index}`} />
              <label
                htmlFor={`option-${question.id}-${index}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${getOptionStyle(index)}`}
              >
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
