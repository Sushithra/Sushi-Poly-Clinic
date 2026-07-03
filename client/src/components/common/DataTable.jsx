/**
 * Responsive Data Table Component
 * 
 * Mobile-first responsive table for displaying structured data
 * Features:
 *  - Mobile: Stacked card layout with swipe actions
 *  - Tablet: Horizontal scroll for tables
 *  - Desktop: Full table layout
 *  - Touch-friendly
 *  - Responsive columns
 * 
 * Usage:
 * <DataTable
 *   columns={[{ key: 'name', label: 'Name', responsive: 'always' }]}
 *   rows={data}
 *   actions={[{ label: 'Edit', onClick: handleEdit }]}
 * />
 */

import React, { useState } from 'react';

export function DataTable({
  columns = [],
  rows = [],
  actions = [],
  loading = false,
  onRowClick,
  striped = true,
  hoverable = true,
  compact = false,
  className = '',
}) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(columnKey);
      setSortDesc(false);
    }
  };

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      {/* Desktop Table View */}
      <table className="hidden md:table w-full border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="bg-neutral-50 border-b-2 border-neutral-200">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={`
                  px-6 py-4 text-left text-sm font-semibold text-neutral-700
                  ${column.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''}
                  ${column.width ? `w-${column.width}` : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        sortBy === column.key && sortDesc ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && <th className="px-6 py-4 text-center">Actions</th>}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-neutral-200 transition-colors
                ${striped && index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}
                ${hoverable ? 'hover:bg-primary-50 cursor-pointer' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={`${index}-${column.key}`}
                  className={`px-6 py-4 text-sm text-neutral-700 ${compact ? 'py-2' : ''}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {actions.map((action, aIndex) => (
                      <button
                        key={aIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          action.variant === 'danger'
                            ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            className="bg-white rounded-lg border border-neutral-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {columns.slice(0, 3).map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-neutral-600 uppercase">
                    {column.label}
                  </span>
                  <span className="text-sm text-neutral-900 text-right">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Actions */}
            {actions.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
                {actions.map((action, aIndex) => (
                  <button
                    key={aIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                    }}
                    className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                      action.variant === 'danger'
                        ? 'bg-danger-100 text-danger-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rows.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-500 text-sm md:text-base">No data available</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-sm">Loading...</p>
        </div>
      )}
    </div>
  );
}

/**
 * Responsive List Component (alternative to tables)
 * Better for mobile, displays data as list items
 */
export function DataList({
  items = [],
  renderItem,
  actions = [],
  loading = false,
  emptyMessage = 'No items available',
  className = '',
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-neutral-200 p-4 md:p-6 flex justify-between items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            {renderItem(item)}
          </div>

          {actions.length > 0 && (
            <div className="flex-shrink-0 flex gap-2">
              {actions.map((action, aIndex) => (
                <button
                  key={aIndex}
                  onClick={() => action.onClick(item)}
                  title={action.label}
                  className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {action.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && !loading && (
        <div className="text-center py-8 bg-neutral-50 rounded-lg">
          <p className="text-neutral-500 text-sm">{emptyMessage}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}
    </div>
  );
}
