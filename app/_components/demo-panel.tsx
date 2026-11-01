import Link from "next/link";

type DemoPanelProps = {
  title: string;
  description: string;
  action: { href: string; label: string };
};

/**
 * 演示模式下替代真实表单的入口卡片。
 * 只出现在开发环境（isDemoMode() 在生产构建里恒为 false）。
 */
export function DemoPanel({ title, description, action }: DemoPanelProps) {
  return (
    <section className="card">
      <p className="demo-note">演示模式 · 未连接数据库</p>

      <h2 className="card-title" style={{ marginTop: 14 }}>
        {title}
      </h2>
      <p className="card-sub">{description}</p>

      <div className="form">
        <Link className="btn-primary" href={action.href}>
          {action.label}
        </Link>
        <p className="hint">
          这是 MVP 阶段的演示入口。真实注册与登录需要这台机器能访问 Supabase；把 .env.local 里的
          PAWISLE_DEMO 去掉就会自动切回真登录。
        </p>
      </div>
    </section>
  );
}
