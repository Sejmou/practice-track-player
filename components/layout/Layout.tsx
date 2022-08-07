import React from 'react';

import classes from './Layout.module.css';

// we now need to explicitly state if a component accepts children: https://solverfox.dev/writing/no-implicit-children/
const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <main className={classes.main}>{children}</main>
    </div>
  );
};
export default Layout;
