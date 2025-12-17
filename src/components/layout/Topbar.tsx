interface TopbarProps {
    title: string;
    breadcrumb?: string[];
}

export function Topbar({ title, breadcrumb }: TopbarProps) {
    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200" style={{ height: '64px' }}>
            <div className="h-full px-6 flex items-center justify-between">
                <div>
                    {breadcrumb && breadcrumb.length > 0 && (
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            {breadcrumb.map((crumb, index) => (
                                <span key={index} className="flex items-center gap-2">
                                    {index > 0 && <span className="text-gray-300">/</span>}
                                    <span>{crumb}</span>
                                </span>
                            ))}
                        </nav>
                    )}
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                </div>
            </div>
        </header>
    );
}
