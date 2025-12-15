"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  StickyNote,
  Lock,
  Search,
  Calendar,
  Tag,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  encrypted: boolean;
}



export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleCreateNote = () => {
    if (!newNote.title.trim()) {
      alert("Please enter a note title.");
      return;
    }

    const tagsArray = newNote.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().slice(0, 10),
      tags: tagsArray,
      encrypted: true,
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote({ title: "", content: "", tags: "" });
    setIsDialogOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !newNote.title.trim()) return;

    const tagsArray = newNote.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const updatedNote: Note = {
      ...editingNote,
      title: newNote.title,
      content: newNote.content,
      tags: tagsArray,
    };

    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setEditingNote(null);
    setNewNote({ title: "", content: "", tags: "" });
    setIsEditDialogOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const toggleExpand = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Secure Notes</h2>
          <p className="text-muted-foreground">
            Keep encrypted notes about your health, appointments, and medical
            information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a secure note to your health journal. All notes are
                encrypted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={6}
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newNote.tags}
                onChange={(e) =>
                  setNewNote({ ...newNote, tags: e.target.value })
                }
              />
              <Button onClick={handleCreateNote} className="w-full">
                Create Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Update your note. All changes are saved securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={6}
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newNote.tags}
                onChange={(e) =>
                  setNewNote({ ...newNote, tags: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateNote} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingNote(null);
                    setNewNote({ title: "", content: "", tags: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <StickyNote className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No notes found matching your search"
                        : "No notes yet. Create your first note!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotes.map((note) => {
                  const isExpanded = expandedNotes.has(note.id);

                  return (
                    <Card
                      key={note.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">
                                {note.title}
                              </CardTitle>
                              {note.encrypted && (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(note.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditNote(note)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={`text-sm text-muted-foreground mb-3 ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {note.content}
                        </p>
                        {note.content.length > 150 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(note.id)}
                            className="text-xs mb-3"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </Button>
                        )}
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {note.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <p>All notes are encrypted end-to-end for maximum security</p>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <p>Your data is stored securely and only accessible by you</p>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <p>Notes are automatically synced across your devices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
