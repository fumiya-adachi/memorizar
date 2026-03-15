import { forwardRef } from "react"

type Option = {
  value: string
  label: string
}

type SelectProps = {
  label?: string
  id: string
  name: string
  options: Option[]
  placeholder?: string
  className?: string
  defaultValue?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      name,
      options,
      placeholder,
      className = "",
      defaultValue,
      ...props
    },
    ref
  ) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            name={name}
            defaultValue={defaultValue}
            className={`w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 outline-none focus:border-gray-900 ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    )
  }
)

Select.displayName = "Select"