import { useState, useEffect, useRef } from "react"
import { Input } from "./ui/input"

interface DebouncedInputProps {
  id?: string
  placeholder?: string
  value?: string
  className?: string
  onDebounce: (value: string) => void
  debounceTime?: number
}

export default function DebouncedInput(props: DebouncedInputProps) {
  const [inputValue, setInputValue] = useState(props.value || "")
  const lastDebouncedValue = useRef(props.value || "")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== lastDebouncedValue.current) {
        props.onDebounce(inputValue)
        lastDebouncedValue.current = inputValue
      }
    }, props.debounceTime || 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, props.onDebounce, props.debounceTime])

  useEffect(() => {
    if (props.value !== undefined && props.value !== inputValue) {
      setInputValue(props.value)
      lastDebouncedValue.current = props.value
    }
  }, [props.value, inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <Input
      id={props.id}
      placeholder={props.placeholder}
      value={inputValue}
      className={props.className}
      onChange={handleChange}
    />
  )
}