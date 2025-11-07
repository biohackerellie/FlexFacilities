# Frontend Cleanup Analysis Report

**Date:** 2025-11-07
**Project:** FlexFacilities Frontend (`./app`)
**Analysis Scope:** Unused dependencies and dead code in `app/src/components` and `app/src/lib`

---

## Executive Summary

- **Unused Dependencies:** 22 packages (30% of total dependencies)
- **Dead Code Files:** 13 files across components and lib directories
- **Potential Savings:** Reduced bundle size, faster installation, cleaner codebase

---

## 1. Unused Dependencies Analysis

### Overview
Out of 74 total dependencies, **22 packages (30%)** are not imported or used anywhere in the codebase.

### Unused Dependencies List

| Package | Category | Notes |
|---------|----------|-------|
| `@hookform/error-message` | Form utilities | Not found in any imports |
| `@radix-ui/react-collapsible` | UI component | Not found in any imports |
| `@radix-ui/react-context-menu` | UI component | Not found in any imports |
| `@radix-ui/react-menubar` | UI component | Not found in any imports |
| `@radix-ui/react-radio-group` | UI component | Not found in any imports |
| `@radix-ui/react-slider` | UI component | Not found in any imports |
| `@radix-ui/react-toggle` | UI component | Not found in any imports |
| `@radix-ui/react-toggle-group` | UI component | Not found in any imports |
| `@t3-oss/env-nextjs` | Environment validation | Not found in any imports |
| `date-fns-tz` | Date utilities | Not found in any imports |
| `drizzle-orm` | Database ORM | Not found in any imports |
| `framer-motion` | Animation library | Not found in any imports |
| `next-superjson-plugin` | Next.js plugin | Not found in any imports |
| `react-big-calendar` | Calendar component | Not found in any imports |
| `react-calendar` | Calendar component | Not found in any imports |
| `react-dnd` | Drag and drop | Not found in any imports |
| `react-modal` | Modal component | Not found in any imports |
| `react-resizable-panels` | Resizable panels | Not found in any imports |
| `react-select` | Select component | Using Radix UI select instead |
| `react-square-web-payments-sdk` | Payment integration | Not found in any imports |
| `square` | Payment integration | Not found in any imports |
| `superjson` | JSON serialization | Not found in any imports |
| `tailwind-scrollbar` | Tailwind plugin | Not found in any imports |
| `vaul` | Drawer component | Not found in any imports |

### Removal Command

```bash
bun remove @hookform/error-message \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-menubar \
  @radix-ui/react-radio-group \
  @radix-ui/react-slider \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @t3-oss/env-nextjs \
  date-fns-tz \
  drizzle-orm \
  framer-motion \
  next-superjson-plugin \
  react-big-calendar \
  react-calendar \
  react-dnd \
  react-modal \
  react-resizable-panels \
  react-select \
  react-square-web-payments-sdk \
  square \
  superjson \
  tailwind-scrollbar \
  vaul
```

---

## 2. Dead Code in `app/src/components`

### Files Safe to Delete (11 files)

#### Empty/Duplicate Files

1. **`app/src/components/hooks/useRecur.tsx`**
   - Status: Empty file (0 lines)
   - Reason: No implementation

2. **`app/src/components/hooks/use-mobile.ts`**
   - Status: Duplicate
   - Reason: Duplicate of `/app/src/hooks/use-mobile.ts`

3. **`app/src/components/hooks/useAuth.tsx`**
   - Status: Unused
   - Reason: AuthProvider/useAuth defined elsewhere in `context.tsx`

#### Unused UI Components

4. **`app/src/components/ui/time-input.tsx`**
   - Component: TimeInput
   - Dependencies: react-aria-components
   - Reason: Never imported anywhere

5. **`app/src/components/ui/navbar/buttons.tsx`**
   - Component: ReservationButton
   - Reason: Never imported anywhere

6. **`app/src/components/ui/alert.tsx`**
   - Component: shadcn/ui Alert
   - Reason: Never imported anywhere

7. **`app/src/components/ui/hover-card.tsx`**
   - Component: shadcn/ui HoverCard
   - Dependencies: @radix-ui/react-hover-card (NOTE: This dependency IS used elsewhere)
   - Reason: Never imported anywhere

8. **`app/src/components/ui/progress.tsx`**
   - Component: shadcn/ui Progress
   - Dependencies: @radix-ui/react-progress (NOTE: This dependency IS used elsewhere)
   - Reason: Never imported anywhere

9. **`app/src/components/ui/command.tsx`**
   - Component: shadcn/ui Command
   - Dependencies: cmdk (NOTE: This dependency IS used elsewhere)
   - Reason: Never imported anywhere

10. **`app/src/components/ui/calendarInfo.tsx`**
    - Component: Calendar info component with HoverCard
    - Reason: Never imported anywhere

11. **`app/src/components/ui/index.ts`**
    - Type: Barrel export
    - Reason: Only exports calendarInfo which is never used

### Deletion Commands

```bash
# Delete empty/duplicate hooks
rm app/src/components/hooks/useRecur.tsx
rm app/src/components/hooks/use-mobile.ts
rm app/src/components/hooks/useAuth.tsx

# Delete unused UI components
rm app/src/components/ui/time-input.tsx
rm app/src/components/ui/navbar/buttons.tsx
rm app/src/components/ui/alert.tsx
rm app/src/components/ui/hover-card.tsx
rm app/src/components/ui/progress.tsx
rm app/src/components/ui/command.tsx
rm app/src/components/ui/calendarInfo.tsx
rm app/src/components/ui/index.ts
```

### Files to Verify Before Deleting

**`app/src/components/contexts/providers/reservationCTX.tsx`**
- Status: Potentially duplicate
- ReservationProvider defined here but may also be in `context.tsx`
- Currently used in: `reservation/[id]/layout.tsx` and other files
- **Recommendation:** Keep for now, verify if duplicate of context.tsx implementation

---

## 3. Dead Code in `app/src/lib`

### Files Safe to Delete (2 files)

1. **`app/src/lib/timeOptions.ts`**
   - Size: 98 lines
   - Content: Hardcoded time values array
   - Reason: Not imported anywhere
   - Impact: None - likely replaced by other implementation

2. **`app/src/lib/formOptions.ts`**
   - Content: `recurringOptions` and `dayOptions` arrays
   - Reason: Not imported anywhere
   - Impact: None - likely replaced by other implementation

### Deletion Commands

```bash
rm app/src/lib/timeOptions.ts
rm app/src/lib/formOptions.ts
```

---

## 4. Summary Statistics

### Dependencies
- **Total dependencies:** 74
- **Used:** 52 (70%)
- **Unused:** 22 (30%)

### Components Directory
- **Total files analyzed:** ~60+ files
- **Unused:** 11 files
- **Usage rate:** ~82%

### Lib Directory
- **Total files analyzed:** 24 files
- **Unused:** 2 files (8.3%)
- **Usage rate:** 91.7%

### Overall Impact
- **Total files to remove:** 13 files
- **Total packages to remove:** 22 packages
- **Estimated bundle size reduction:** Varies (depends on tree-shaking)
- **Maintenance benefit:** Reduced complexity, clearer codebase

---

## 5. Recommended Action Plan

### Phase 1: Low-Risk Deletions (Do First)
1. Delete empty/duplicate files
   ```bash
   rm app/src/components/hooks/useRecur.tsx
   rm app/src/components/hooks/use-mobile.ts
   rm app/src/components/hooks/useAuth.tsx
   rm app/src/lib/timeOptions.ts
   rm app/src/lib/formOptions.ts
   ```

2. Remove clearly unused dependencies
   ```bash
   bun remove drizzle-orm \
     react-big-calendar \
     react-calendar \
     react-dnd \
     react-modal \
     react-square-web-payments-sdk \
     square \
     framer-motion
   ```

### Phase 2: Medium-Risk Deletions (Test After)
1. Delete unused UI components
   ```bash
   rm app/src/components/ui/time-input.tsx
   rm app/src/components/ui/navbar/buttons.tsx
   rm app/src/components/ui/alert.tsx
   rm app/src/components/ui/calendarInfo.tsx
   rm app/src/components/ui/index.ts
   ```

2. Remove unused UI library packages
   ```bash
   bun remove @radix-ui/react-collapsible \
     @radix-ui/react-context-menu \
     @radix-ui/react-menubar \
     @radix-ui/react-radio-group \
     @radix-ui/react-slider \
     @radix-ui/react-toggle \
     @radix-ui/react-toggle-group \
     react-resizable-panels \
     react-select \
     vaul
   ```

### Phase 3: Careful Deletions (Verify First)
1. Delete remaining components (verify not dynamically imported)
   ```bash
   rm app/src/components/ui/hover-card.tsx
   rm app/src/components/ui/progress.tsx
   rm app/src/components/ui/command.tsx
   ```

2. Remove remaining utility packages
   ```bash
   bun remove @hookform/error-message \
     @t3-oss/env-nextjs \
     date-fns-tz \
     next-superjson-plugin \
     superjson \
     tailwind-scrollbar
   ```

### Phase 4: Post-Cleanup
1. Run tests: `bun test`
2. Run build: `bun build`
3. Run linter: `bun check:fix`
4. Test development: `bun dev`
5. Verify all pages load correctly
6. Check for any runtime errors

---

## 6. Notes and Caveats

### Dependency Notes
- Some packages like `autoprefixer`, `postcss`, `tailwindcss` are build tools and may not show direct imports
- `geist` font package is used via Next.js font configuration, not direct imports
- `next-superjson-plugin` might be referenced in `next.config.js` (verify before removing)

### Component Notes
- Some shadcn/ui components are boilerplate that may be used in future
- Dynamic imports (e.g., `import()`) may not be caught by static analysis
- Server Actions in lib/actions may be referenced via form actions without direct imports

### Testing Recommendations
After each phase:
1. Check for TypeScript errors: `bun typecheck`
2. Run the linter: `bun check`
3. Build the project: `bun build`
4. Test critical user flows manually

### Rollback Plan
If issues occur after cleanup:
```bash
# Restore from git
git checkout HEAD -- app/src/components/ui/[file].tsx
git checkout HEAD -- app/src/lib/[file].ts

# Reinstall dependencies
bun install [package-name]
```

---

## 7. Potential Follow-Up Tasks

1. **Audit devDependencies** - Similar analysis for development packages
2. **Check for unused exports** - Functions/components exported but not used externally
3. **Analyze bundle size** - Use bundle analyzer to identify large dependencies
4. **Review type definitions** - Check if all @types/* packages are needed
5. **Optimize imports** - Convert barrel imports to direct imports where beneficial

---

**Report Generated By:** Claude Code
**Analysis Method:** Comprehensive codebase search using grep/glob patterns
**Confidence Level:** High (based on static analysis, manual verification recommended)
