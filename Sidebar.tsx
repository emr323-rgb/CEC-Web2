import React from 'react';
import { Link } from 'wouter';
import { User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

const Sidebar = () => {
  const { user, logoutMutation } = useAuth();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-500">Admin</div>
        <nav className="flex flex-col gap-1">
          {user && (
            <>
              <Link href="/admin/locations" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Locations
              </Link>
              <Link href="/admin/staff" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Staff
              </Link>
              <Link href="/admin/treatments" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Treatment Programs
              </Link>
              <Link href="/admin/insurance" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Insurance Providers
              </Link>
              <Link href="/admin/content" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Site Content
              </Link>
              <Link href="/admin/testimonials" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                Testimonials
              </Link>
              <hr className="my-2" />
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to log out?')) {
                    logoutMutation.mutate();
                  }
                }}
                className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md text-red-600"
              >
                Log Out
              </button>
            </>
          )}
          {!user && (
            <Link href="/auth" className="px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
              Log In
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;