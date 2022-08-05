import { FriendRelationItem } from '@toys/common/entity/im/Friend';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAppManager } from '..';

export default function useFetchNewFriendRequests() {
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRelationItem[]>(
    []
  );
  const appManager = useMemo(() => {
    return getAppManager();
  }, []);

  const run = useCallback(async () => {
    try {
      const data = await appManager.fetchIncomingFriendRequests();
      setFriendRequests(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [appManager]);

  useEffect(() => {
    setLoading(true);
    run();
  }, [run]);

  return {
    loading,
    friendRequests,
    refresh: run,
  };
}
