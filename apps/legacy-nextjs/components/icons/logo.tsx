import { cn } from '@rov/ui/lib/utils'

function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-4 text-current', className)}
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2380_4290)">
        <path
          d="M8.00001 4.25C8.00001 6.32107 6.35535 8 4.32655 8H0.653076V4.25C0.653076 2.17893 2.29774 0.5 4.32655 0.5C6.35535 0.5 8.00001 2.17893 8.00001 4.25Z"
          fill="currentColor"
        />
        <path
          d="M8 11.75C8 9.67893 9.64467 8 11.6735 8H15.3469V11.75C15.3469 13.8211 13.7023 15.5 11.6735 15.5C9.64467 15.5 8 13.8211 8 11.75Z"
          fill="currentColor"
        />
        <path
          d="M0.653076 11.75C0.653076 13.8211 2.29774 15.5 4.32655 15.5H8.00001V11.75C8.00001 9.67893 6.35535 8 4.32655 8C2.29774 8 0.653076 9.67893 0.653076 11.75Z"
          fill="currentColor"
        />
        <path
          d="M15.3469 4.25C15.3469 2.17893 13.7023 0.5 11.6735 0.5H8V4.25C8 6.32107 9.64467 8 11.6735 8C13.7023 8 15.3469 6.32107 15.3469 4.25Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_2380_4290">
          <rect fill="currentColor" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Logo
