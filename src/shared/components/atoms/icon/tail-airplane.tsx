interface Props {
  className?: string;
  fill?: string;
}

function IconTailAirplane({ className, fill }: Props) {
  return (
    <>
      <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        <path
          style={{ fill: fill }}
          strokeWidth="0px"
          d="m3.43,2.81h4.63c.07,0,.13.03.18.08l8.29,9.04s.11.08.18.08h4.56c.13,0,.24.11.24.24v8.95h-9.33s-.06,0-.09-.02l-9.43-3.6c-.09-.04-.15-.12-.15-.22v-3.22c0-.13.11-.24.24-.24l3.13-.04c.16,0,.27-.15.23-.3L3.2,3.11c-.04-.15.07-.3.23-.3Z"
        />
        <rect style={{ fill: '#bfc4c8' }} strokeWidth="0px" x="9.24" y="15.06" width="7.97" height="1.84" />
      </svg>
    </>
  );
}

export default IconTailAirplane;
