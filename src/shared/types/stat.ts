export interface StatBoxProps {
  icon: React.ElementType; // Using React.ElementType to accept MUI icons
  mainText: string;
  subText: string;
  children?: React.ReactNode;
}

export interface StatusItem {
  label: string;
  value: string | number;
}

export interface StatusListProps {
  items: StatusItem[];
}
