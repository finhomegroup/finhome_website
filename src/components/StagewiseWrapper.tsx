import { useEffect, useState } from 'react';

const StagewiseWrapper = () => {
  const [StagewiseToolbar, setStagewiseToolbar] = useState<any>(null);
  const [ReactPlugin, setReactPlugin] = useState<any>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Dynamic import only in development
      import('@stagewise/toolbar-react').then((module) => {
        setStagewiseToolbar(() => module.StagewiseToolbar);
      });
      
      import('@stagewise-plugins/react').then((module) => {
        setReactPlugin(module.default);
      });
    }
  }, []);

  if (!import.meta.env.DEV || !StagewiseToolbar || !ReactPlugin) {
    return null;
  }

  return (
    <StagewiseToolbar 
      config={{
        plugins: [ReactPlugin]
      }}
      enabled={true}
    />
  );
};

export default StagewiseWrapper; 