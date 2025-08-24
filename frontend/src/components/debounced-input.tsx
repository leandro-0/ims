import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Input } from "./ui/input"

interface DebouncedInputProps {
  id?: string
  placeholder?: string
  value?: string
  className?: string
  onDebounce: (value: string) => void
  debounceTime?: number
}

export interface DebouncedInputRef {
  clear: () => void
}

const DebouncedInput = forwardRef<DebouncedInputRef, DebouncedInputProps>((props, ref) => {
  const [inputValue, setInputValue] = useState(props.value || "")
  const lastDebouncedValue = useRef(props.value || "")

  useImperativeHandle(ref, () => ({
    clear: () => {
      setInputValue("")
      lastDebouncedValue.current = ""
    }
  }))

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== lastDebouncedValue.current) {
        props.onDebounce(inputValue)
        lastDebouncedValue.current = inputValue
      }
    }, props.debounceTime || 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.debounceTime, inputValue, props.onDebounce])

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
})

DebouncedInput.displayName = "DebouncedInput"

export default DebouncedInput