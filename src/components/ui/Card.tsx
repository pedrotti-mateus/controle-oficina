import type { ReactNode } from 'react';

interface CardProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
    return (
        <div className={`card ${className}`}>
            {(title || description) && (
                <div className="mb-4">
                    {title && <h3 className="card-title">{title}</h3>}
                    {description && <p className="card-description">{description}</p>}
                </div>
            )}
            {children}
        </div>
    );
}
