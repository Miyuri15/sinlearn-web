import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex">
      {/* Sidebar on the left */}
      <Sidebar
        chats={[
          {
            id: "1",
            title: "New Learning Chat",
            type: "learning",
            time: "1 minute ago",
          },
          {
            id: "2",
            title: "New Evaluation Chat",
            type: "evaluation",
            time: "12 minutes ago",
          },
        ]}
      />

      {/* Main content area */}
      <div className="flex-1 p-6">
        Dashboard
      </div>
    </div>
  );
}
