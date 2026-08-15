import { useState, useEffect } from 'react';

const KeepAlive = ({ show, children }) => {
  const [hasRendered, setHasRendered] = useState(show);

  useEffect(() => {
    if (show && !hasRendered) {
      setHasRendered(true);
    }
  }, [show, hasRendered]);

  if (!hasRendered) return null;

  return (
    <div style={{ display: show ? 'block' : 'none', height: '100%', width: '100%' }}>
      {children}
    </div>
  );
};

export default KeepAlive;
