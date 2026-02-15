/**
 * Approve Content - Frontend Function
 * Handles content approval directly without Edge Function
 */
import { supabase } from '@/lib/supabase';

export async function approveContent({ entity, itemId, status, reason }) {
  try {
    // Map entity type to table name
    const tableMap = {
      'Business': 'businesses',
      'Job': 'jobs',
      'Event': 'events',
      'MarketplaceItem': 'marketplace_items',
      'LostItem': 'lost_items'
    };

    const tableName = tableMap[entity];
    if (!tableName) {
      return { data: null, error: { message: `Unknown entity type: ${entity}` } };
    }

    // Update the content status
    const updateData = { status };
    if (reason) {
      updateData.rejection_reason = reason;
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', itemId);

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Get the item to find the owner and send notification
    const ownerIdColumn = entity === 'Business' ? 'owner_id' 
      : entity === 'Job' ? 'poster_id'
      : entity === 'Event' ? 'organizer_id'
      : entity === 'MarketplaceItem' ? 'seller_id'
      : entity === 'LostItem' ? 'reporter_id'
      : null;

    if (ownerIdColumn) {
      const { data: item } = await supabase
        .from(tableName)
        .select(`${ownerIdColumn}, title, name`)
        .eq('id', itemId)
        .single();

      if (item) {
        const itemTitle = item.title || item.name || entity;
        const notificationMessage = status === 'approved'
          ? `Your ${entity.toLowerCase()} "${itemTitle}" has been approved!`
          : `Your ${entity.toLowerCase()} "${itemTitle}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`;

        await supabase
          .from('notifications')
          .insert({
            user_id: item[ownerIdColumn],
            message: notificationMessage,
            type: status === 'approved' ? 'success' : 'error'
          });
      }
    }

    return { 
      data: { 
        success: true, 
        message: `${entity} ${status} successfully` 
      }, 
      error: null 
    };

  } catch (error) {
    console.error('Approve content error:', error);
    return { data: null, error: { message: error.message } };
  }
}
