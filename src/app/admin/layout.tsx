import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Book,
  HelpCircle,
  FolderOpen,
  ArrowLeft,
  Shield,
  User,
  Calendar,
  Users,
  Activity,
  ClipboardList
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Enforce server-side role check
  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const user = session.user;

  const sidebarLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/content/articles", label: "Articles", icon: FileText },
    { href: "/admin/content/ayurveda", label: "Ayurveda", icon: BookOpen },
    { href: "/admin/content/books", label: "Books", icon: Book },
    { href: "/admin/content/faqs", label: "FAQs", icon: HelpCircle },
    { href: "/admin/content/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/yoga", label: "Yoga Overview", icon: Shield },
    { href: "/admin/yoga/classes", label: "Yoga Classes", icon: Activity },
    { href: "/admin/yoga/instructors", label: "Instructors", icon: Users },
    { href: "/admin/yoga/sessions", label: "Sessions", icon: Calendar },
    { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#2D3E35] text-[#FCFCFA] flex flex-col justify-between shrink-0 border-r border-[#355E3B]/25">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-primary-sage/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-gold/20 flex items-center justify-center text-accent-gold border border-accent-gold/30">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wide">
                Sattvic Admin
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold">
                CMS Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#FCFCFA]/80 hover:text-[#FCFCFA] hover:bg-primary-forest/30 transition-colors focus:outline-none"
                >
                  <Icon size={18} className="text-primary-sage" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section at bottom of sidebar */}
        <div className="p-4 border-t border-primary-sage/10 space-y-3 bg-[#24332B]">
          <div className="flex items-center gap-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Admin"}
                className="w-9 h-9 rounded-full object-cover border border-accent-gold/35"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-sage/20 border border-primary-sage/40 flex items-center justify-center text-primary-sage text-sm font-bold">
                <User size={16} />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-[#FCFCFA]">
                {user.name || "Seeker Admin"}
              </p>
              <p className="text-[10px] text-primary-sage truncate">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-1.5 w-full text-center text-[11px] uppercase tracking-widest font-bold text-accent-gold border border-accent-gold/30 hover:bg-accent-gold hover:text-[#2D3E35] py-2 rounded-full transition-all duration-300 focus:outline-none"
          >
            <ArrowLeft size={10} />
            User Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="glass-panel sticky top-0 z-10 py-4 px-6 border-b border-primary-sage/10 flex items-center justify-between md:hidden">
          <Link href="/" className="font-serif text-lg font-bold tracking-wide text-primary-forest">
            SATTVIC <span className="text-accent-gold text-xs font-sans font-light tracking-widest border border-accent-gold/30 px-1 py-0.5 ml-1">LIVING</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold text-primary-forest hover:text-accent-gold transition-colors"
            >
              Admin Panel
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#FCFCFA] bg-primary-forest px-3 py-1.5 rounded-full"
            >
              Exit
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
