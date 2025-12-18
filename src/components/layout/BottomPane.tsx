import clsx from 'clsx';

export const BottomPane = () => {
  return (
    <div className={clsx(
      "relative h-full w-full",
      "glass", // Using the custom utility class defined in index.css
      "rounded-3xl",
      "flex items-center justify-center"
    )}>
      <span className="text-gray-500 font-medium">Focus / Details</span>
    </div>
  );
};
