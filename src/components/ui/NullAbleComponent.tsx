import React from "react";

type NullAbleComponentProps = {
  children: React.ReactNode;
  isNull?: boolean;
};
const NullAbleComponent = ({ children, isNull }: NullAbleComponentProps) => {
  if (isNull) {
    return null;
  }
  return children;
};

export default NullAbleComponent;
