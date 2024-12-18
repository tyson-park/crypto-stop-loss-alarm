'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-secondary-foreground transition-colors">Home</Link>
          <Link href="/about" className="hover:text-secondary-foreground transition-colors">About</Link>
          <Link href="/contact" className="hover:text-secondary-foreground transition-colors">Contact</Link>
        </nav>
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-secondary text-secondary-foreground">
          <Link href="/" className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">Home</Link>
          <Link href="/about" className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">About</Link>
          <Link href="/contact" className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">Contact</Link>
        </nav>
      )}
    </header>
  )
}

export default Header

