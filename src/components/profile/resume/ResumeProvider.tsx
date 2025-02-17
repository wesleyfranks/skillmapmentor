import React from 'react';
import { ResumeProvider } from './ResumeContext';

interface Props {
  children: React.ReactNode;
}

const AppProviders: React.FC<Props> = ({ children }) => {
  return <ResumeProvider>{children}</ResumeProvider>;
};

export default AppProviders;
