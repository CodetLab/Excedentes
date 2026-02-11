import type { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  className?: string;
};

const Table = ({ children, className }: TableProps) => {
  const classes = ["table", className].filter(Boolean).join(" ");

  return (
    <div className="table-wrap">
      <table className={classes}>{children}</table>
    </div>
  );
};

export default Table;
