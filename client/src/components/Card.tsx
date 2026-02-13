import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

const Card = ({ title, actions, children, className }: CardProps) => {
  const classes = ["card", className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
};

export default Card;
