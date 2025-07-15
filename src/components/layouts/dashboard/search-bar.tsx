// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import { Search } from "lucide-react";
// import { Input } from "../../ui/input";
// import { useUserSearch } from "@/hooks/use-users";
// // import { useDebounce } from "@/hooks/use-debounce";

// export default function SearchBar() {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   // const debouncedSearchTerm = useDebounce(searchTerm, 300);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const { users, isGettingUsers } = useUserSearch({ isAdmin: true });

//   const filteredUsers =
//     searchTerm.trim() === ""
//       ? []
//       : users.filter((user) =>
//           user.label?.toLowerCase().includes(searchTerm.toLowerCase())
//         );

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (searchTerm.trim() !== "") {
//       setIsOpen(true);
//     }
//   }, [searchTerm]);

//   function handleUserSelect(userId: string, userName: string) {
//     setSearchTerm(userName);
//     setIsOpen(false);
//     router.push(`settings/users/`);
//     // router.push(`settings/users/${userId}`);
//   }

//   return (
//     <div className="relative w-full flex-1">
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input
//           ref={inputRef}
//           type="search"
//           name="search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           onFocus={() => searchTerm.trim() !== "" && setIsOpen(true)}
//           placeholder="Search users..."
//           className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
//         />
//       </div>

//       {isOpen && (
//         <div
//           ref={dropdownRef}
//           className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-background border shadow-lg md:w-2/3 lg:w-1/3"
//         >
//           {isGettingUsers ? (
//             <div className="px-4 py-2 text-sm text-muted-foreground">
//               Loading...
//             </div>
//           ) : filteredUsers.length > 0 ? (
//             <ul className="py-1">
//               {filteredUsers.map((user) => (
//                 <li
//                   key={user.value}
//                   onClick={() => handleUserSelect(user.value, user.label)}
//                   className="px-4 py-2 text-sm hover:bg-accent cursor-pointer flex items-center"
//                 >
//                   <div className="flex-grow">
//                     <div className="font-medium">{user.label}</div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <div className="px-4 py-2 text-sm text-muted-foreground">
//               {searchTerm.trim() !== ""
//                 ? "No users found"
//                 : "Type to search users"}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
