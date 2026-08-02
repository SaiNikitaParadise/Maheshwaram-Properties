import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming your input component is here
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Adjust path if necessary

export function Navbar() {
  return (
    <header className="w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <div className="font-bold text-lg text-white">
          Maheshwaram Properties
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex items-center space-x-1">
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>
                About Us
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/ventures.html" className={navigationMenuTriggerStyle()}>
                Ventures
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/services" className={navigationMenuTriggerStyle()}>
                Services
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/contact" className={navigationMenuTriggerStyle()}>
                Contact Us
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/blog" className={navigationMenuTriggerStyle()}>
                Blog
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* 👇 Search Box Added Next to Blog (Desktop) */}
            <div className="relative flex items-center ml-3">
              <span className="absolute left-3 text-muted-foreground pointer-events-none">
                <Search size={14} />
              </span>
              <Input
                type="text"
                placeholder="Search ventures..."
                className="pl-9 pr-4 py-1.5 h-9 text-xs bg-gray-800/50 border-gray-700 rounded-full text-white placeholder:text-muted-foreground focus-visible:ring-amber-500 w-40 lg:w-48"
              />
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu & Search Drawer Section */}
        <div className="md:hidden flex flex-col w-full absolute top-16 left-0 bg-background border-b border-gray-800 px-4 py-4 space-y-3">
          <a href="/" className="text-sm font-medium text-white hover:text-amber-400">Home</a>
          <a href="/about" className="text-sm font-medium text-white hover:text-amber-400">About Us</a>
          <a href="/ventures.html" className="text-sm font-medium text-white hover:text-amber-400">Ventures</a>
          <a href="/services" className="text-sm font-medium text-white hover:text-amber-400">Services</a>
          <a href="/contact" className="text-sm font-medium text-white hover:text-amber-400">Contact Us</a>
          <a href="/blog" className="text-sm font-medium text-white hover:text-amber-400">Blog</a>

          {/* 👇 Search Box Added for Mobile Version */}
          <div className="relative flex items-center pt-2">
            <span className="absolute left-3 text-muted-foreground pointer-events-none">
              <Search size={16} />
            </span>
            <Input
              type="text"
              placeholder="Search ventures..."
              className="w-full pl-9 pr-4 py-2 h-10 text-sm bg-gray-800/50 border-gray-700 rounded-full text-white placeholder:text-muted-foreground focus-visible:ring-amber-500"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
