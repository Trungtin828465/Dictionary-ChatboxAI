import { WorkspaceList } from "@/components/WorkspaceList";
import { useAuth } from "@/contexts/auth-context";
import styles from "./styles.module.scss";
import NonSupportedFeature from "../NonSupportedFeature";

export default function MyListWorkspace() {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <div className={styles.container}>
          <WorkspaceList />
        </div>
      ) : (
        <NonSupportedFeature />
      )}
    </>
  );
}
