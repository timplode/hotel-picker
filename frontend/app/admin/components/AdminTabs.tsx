"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Tabs, Tab, Paper } from '@mui/material';

interface AdminTabsProps {
  currentPath: string;
}

export default function AdminTabs({ currentPath }: AdminTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: 'Summary', path: '/admin' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Conferences', path: '/admin/conferences' },
    { label: 'Exports', path: '/admin/exports' }
  ];

  const getCurrentTabIndex = () => {
    const index = tabs.findIndex(tab => tab.path === currentPath);
    return index >= 0 ? index : 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const targetPath = tabs[newValue]?.path;
    if (targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs 
        value={getCurrentTabIndex()} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} onClick={() => router.push(tab.path)} />
        ))}
      </Tabs>
    </Paper>
  );
}