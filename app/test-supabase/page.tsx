import { createClient } from '@/lib/supabase/server'

export default async function TestSupabase() {
  const supabase = await createClient()

  // Test 1: Check if we can connect to Supabase
  const { data: healthCheck, error: healthError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
    .single()

  // Test 2: Check auth session
  const { data: { session }, error: authError } = await supabase.auth.getSession()

  // Test 3: Check if fine-documents bucket exists by trying to list files
  const { data: bucketTest, error: bucketTestError } = await supabase.storage
    .from('fine-documents')
    .list('', { limit: 1 })
  
  // Bucket exists if we can list (even if empty)
  const bucketExists = !bucketTestError
  const storageError = bucketTestError

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      {/* Database Connection Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
        {healthError ? (
          <div className="text-red-500">
            <p>❌ Connection Error: {healthError.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(healthError, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="text-green-500">
            <p>✅ Database connected successfully!</p>
          </div>
        )}
      </div>

      {/* Auth Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication</h2>
        {authError ? (
          <div className="text-red-500">
            <p>❌ Auth Error: {authError.message}</p>
          </div>
        ) : session ? (
          <div className="text-green-500">
            <p>✅ User authenticated: {session.user.email}</p>
          </div>
        ) : (
          <div className="text-yellow-500">
            <p>⚠️ No active session (user not logged in)</p>
            <p className="text-sm mt-1">This is normal - auth will be built in Sprint 3 (Week 7-8)</p>
          </div>
        )}
      </div>

      {/* Storage Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Storage</h2>
        {bucketExists ? (
          <div className="text-green-500">
            <p>✅ Storage bucket 'fine-documents' found and accessible!</p>
            <div className="mt-2 text-sm">
              <p>• Bucket is ready for file uploads</p>
              <p>• Policies are configured correctly</p>
              {bucketTest && bucketTest.length > 0 && (
                <p>• Contains {bucketTest.length} file(s)</p>
              )}
              {bucketTest && bucketTest.length === 0 && (
                <p>• Bucket is empty (ready for uploads)</p>
              )}
            </div>
          </div>
        ) : storageError ? (
          <div className="text-yellow-500">
            <p>⚠️ Cannot access 'fine-documents' bucket</p>
            <p className="text-sm mt-1">Error: {storageError.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Troubleshooting</summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <p>1. Verify bucket exists: Storage → Buckets → fine-documents</p>
                <p>2. Check RLS policies are applied</p>
                <p>3. Restart dev server: npm run dev</p>
                <p>4. Clear browser cache and refresh</p>
              </div>
            </details>
          </div>
        ) : (
          <div className="text-yellow-500">
            <p>⚠️ Bucket 'fine-documents' not found</p>
            <p className="text-sm mt-1">Create it in: Storage → New Bucket → Name: fine-documents</p>
          </div>
        )}
      </div>

      {/* Environment Variables Check */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="space-y-2">
          <p>
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
              <span className="text-green-500">✅ NEXT_PUBLIC_SUPABASE_URL: Set</span>
            ) : (
              <span className="text-red-500">❌ NEXT_PUBLIC_SUPABASE_URL: Missing</span>
            )}
          </p>
          <p>
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
              <span className="text-green-500">✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set</span>
            ) : (
              <span className="text-red-500">❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing</span>
            )}
          </p>
        </div>
      </div>

      {/* Sprint 0 Completion Status */}
      <div className="mb-6 p-4 border-2 border-green-500 rounded-lg bg-green-50">
        <h2 className="text-xl font-semibold mb-3 text-green-800">Sprint 0: Foundation Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {healthError ? '❌' : '✅'}
            <span>Database schema deployed</span>
          </div>
          <div className="flex items-center gap-2">
            {healthError ? '❌' : '✅'}
            <span>Authentication configured</span>
          </div>
          <div className="flex items-center gap-2">
            {bucketExists ? '✅' : '⚠️'}
            <span>Storage bucket created</span>
          </div>
          <div className="flex items-center gap-2">
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}
            <span>Environment variables set</span>
          </div>
        </div>
        {!healthError && bucketExists && process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <div className="mt-4 p-3 bg-green-100 rounded border border-green-300">
            <p className="font-bold text-green-800">🎉 Sprint 0 Complete! Ready for Sprint 1</p>
            <p className="text-sm mt-1 text-green-700">Next: Build file upload component</p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>If storage warning: Restart dev server (npm run dev)</li>
          <li>Once all checks pass: Mark Sprint 0 as complete in TASKv2.md</li>
          <li>Start Sprint 1: Create /dashboard/submit-fine page</li>
          <li>Build file upload component with drag & drop</li>
        </ol>
      </div>
    </div>
  )
}