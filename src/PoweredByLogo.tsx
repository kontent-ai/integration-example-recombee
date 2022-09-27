import recombeeLogo from './images/recombee-logo.png'
import { FC } from "react";

export const PoweredByLogo: FC = () => (
  <div style={{ float: 'right', padding: 10 }}>
    <span style={{ paddingRight: 5 }}>powered by</span>
    <img
      height={40}
      src={recombeeLogo}
      alt="Recombee logo"
      title="Recombee logo"
    />
  </div>
);

PoweredByLogo.displayName = 'PoweredByLogo';
