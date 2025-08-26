// Debug script to check and fix admin role
// Run this in your browser console on any page of your app

async function debugAdminAccess() {
  console.log('🔍 Debugging admin access...');
  
  // Get Supabase client
  const { createClient } = await import('./lib/supabase/client.js');
  const supabase = createClient();
  
  // Check current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('❌ Error getting user:', userError);
    return;
  }
  
  if (!user) {
    console.log('❌ No user logged in');
    return;
  }
  
  console.log('✅ Current user:', user.email);
  console.log('User ID:', user.id);
  
  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error('❌ Error getting profile:', profileError);
    
    // Check if profile exists
    if (profileError.code === 'PGRST116') {
      console.log('❌ Profile does not exist! Creating one...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'admin',
          full_name: user.user_metadata?.full_name || null
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return;
      }
      
      console.log('✅ Profile created with admin role:', newProfile);
    }
    return;
  }
  
  console.log('✅ Current profile:', profile);
  
  if (profile.role === 'admin' || profile.role === 'super_admin') {
    console.log('✅ User has admin role!');
    
    // Test direct database query that middleware uses
    const { data: roleCheck, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (roleError) {
      console.error('❌ Error in role check query (same as middleware):', roleError);
    } else {
      console.log('✅ Role check query result:', roleCheck);
    }
    
  } else {
    console.log('❌ User does NOT have admin role. Current role:', profile.role);
    console.log('🔧 Updating to admin role...');
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('❌ Error updating role:', updateError);
      console.log('📋 Manual SQL command to run in Supabase:');
      console.log(`UPDATE public.profiles SET role = 'admin' WHERE id = '${user.id}';`);
    } else {
      console.log('✅ Role updated successfully:', updatedProfile);
      console.log('🔄 Please refresh the page and try accessing /admin again');
    }
  }
}

// Run the debug function
debugAdminAccess().catch(console.error);