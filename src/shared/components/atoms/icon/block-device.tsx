interface Props {
  className?: string;
  fill?: string;
}

function IconBlockDevice({ className, fill }: Props) {
  return (
    <>
      <svg id="_6" data-name="6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        <defs>
          <style></style>
          <clipPath id="clippath">
            <circle strokeWidth="0px" style={{ fill: 'none' }} cx="12" cy="12" r="10" />
          </clipPath>
        </defs>
        <g clipPath={'url(#clippath)'}>
          <g>
            <path
              strokeWidth="0px"
              style={{ fill: fill }}
              d="m18.02,7.74H5.98c-.18,0-.32.14-.32.32v8.37c0,.18.14.32.32.32h4.9v1.19h-1.26c-.09,0-.17.07-.17.17s.07.17.17.17h4.76c.09,0,.17-.07.17-.17s-.07-.17-.17-.17h-1.26v-1.19h4.9c.18,0,.32-.14.32-.32v-8.37c0-.18-.14-.32-.32-.32Z"
            />
            <rect strokeWidth="0px" style={{ fill: '#bfc4c8' }} x="6.09" y="8.17" width="11.82" height="7.07" />
            <rect strokeWidth="0px" style={{ fill: fill }} x="16.26" y="15.99" width=".5" height=".09" rx=".02" ry=".02" />
          </g>
        </g>
        <path
          strokeWidth="0px"
          style={{ fill: fill }}
          d="m19.75,4.25c-2.07-2.07-4.82-3.21-7.75-3.21s-5.68,1.14-7.75,3.21c-2.07,2.07-3.21,4.82-3.21,7.75s1.14,5.68,3.21,7.75c2.07,2.07,4.82,3.21,7.75,3.21s5.68-1.14,7.75-3.21c2.07-2.07,3.21-4.82,3.21-7.75s-1.14-5.68-3.21-7.75Zm-14.23,14.23c-1.73-1.73-2.68-4.03-2.68-6.48,0-2.15.73-4.18,2.08-5.81l12.9,12.9c-1.64,1.35-3.67,2.08-5.81,2.08-2.45,0-4.75-.95-6.48-2.68Zm13.56-.67L6.19,4.92c1.64-1.35,3.67-2.08,5.81-2.08,2.45,0,4.75.95,6.48,2.68,1.73,1.73,2.68,4.03,2.68,6.48,0,2.15-.73,4.18-2.08,5.81Z"
        />
      </svg>
    </>
  );
}

export default IconBlockDevice;
