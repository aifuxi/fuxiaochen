import useUserStore from "@/stores/use-user-store";

export default function Index() {
  const userInfo = useUserStore((s) => s.userInfo);

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold underline">
        Hello world! {userInfo?.nickname}
      </h1>
    </div>
  );
}
