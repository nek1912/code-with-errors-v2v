import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useSupabaseRealtime = (tableName, onInsert, filterColumn = null, filterValue = null) => {
  useEffect(() => {
    let channel = supabase.channel(`realtime-${tableName}`);
    
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: tableName },
      (payload) => {
        // If filtering by a specific journey/user
        if (filterColumn && filterValue) {
          if (payload.new[filterColumn] === filterValue) {
            if (onInsert) onInsert(payload.new);
          }
        } else {
          if (onInsert) onInsert(payload.new);
        }
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, onInsert, filterColumn, filterValue]);
};
