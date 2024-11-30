import React from 'react';

function SignUpBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-accent-100/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Add your decorative elements here */}
        <div className="grid grid-cols-3 gap-8 opacity-50">
          {/* You can add floating elements, icons, or other decorative items */}
        </div>
      </div>
    </div>
  );
}

export default SignUpBackground; 