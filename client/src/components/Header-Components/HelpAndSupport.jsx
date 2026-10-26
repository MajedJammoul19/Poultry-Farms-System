import React from 'react'

const HelpAndSupport = () => {
  return (
     <DropdownButton
                name="help"
                icon={HelpCircle}
                title="المساعدة والدعم"
                buttonClass="group-hover:text-purple-500"
              >
                <div className="px-4 py-3 border-b border-gray-100/50 dark:border-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white">المساعدة والدعم</h3>
                </div>
                <div className="py-1">
                  {helpItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setActiveDropdown(null);
                      }}
                      className="block w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-end gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </button>
                  ))}
                </div>
              </DropdownButton>
  )
}

export default HelpAndSupport
