interface ProjectPageProps {
    params: { id: string };
  }
  
  export default function ProjectPage({ params }: ProjectPageProps) {
    const { id } = params;
  
    return (
      <section className="space-y-4">
        <p className="text-xs text-slate-400">Project ID: {id}</p>
        <h1 className="text-2xl font-semibold">Project details</h1>
        <p className="text-sm text-slate-300/80">
          This page will show the full project info and a “Request to join” flow.
        </p>
      </section>
    );
  }
  