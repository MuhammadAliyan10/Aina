import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Play, Edit, Trash, Chrome, Link2, Link, Globe } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NewWindowNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [URL, setURL] = useState(data.URL || "");
  const [type, setType] = useState(data.type || "normal");
  const [windowState, setWindowState] = useState(data.windowState || "normal");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleSave = (newDescription: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, description: newDescription } }
          : node
      )
    );
    setIsDialogOpen(false);
  };

  return (
    <div className="relative min-w-[12rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg">
      {/* Action buttons, visible on hover */}
      <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <Chrome
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
        <span className="border border-r-white h-[15px]"></span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Edit
              size={18}
              className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
              onClick={() => setIsDialogOpen(true)}
            />
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white rounded-lg shadow-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                New Window
              </DialogTitle>
            </DialogHeader>
            <Label>Description</Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <Label>Type</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-transparent border border-gray-200 text-white hover:bg-transparent capitalize">
                  {type}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Window Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={type} onValueChange={setType}>
                  <DropdownMenuRadioItem value="normal">
                    Normal
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="popup">
                    Popup
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="panel">
                    Panel
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Label>URL (Optional)</Label>
            <Input
              type="text"
              value={URL}
              onChange={(e) => setURL(e.target.value)}
              placeholder="Enter URL"
              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />

            <Label>Widow State</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-transparent border border-gray-200 text-white hover:bg-transparent capitalize">
                  {windowState}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Window States</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={windowState}
                  onValueChange={setWindowState}
                >
                  <DropdownMenuRadioItem value="normal">
                    Normal
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="minimized">
                    Minimized
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="maximized">
                    Maximized
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fullscreen">
                    FullScreen
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogFooter className="mt-4">
              <Button
                onClick={() => handleSave(description)}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span className="border border-r-white h-[15px]"></span>
        <Trash
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
      </div>
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <span className="p-3 bg-black text-white rounded-lg shadow-md">
            <Globe size={20} />
          </span>
          <p className="text-sm font-semibold">New Window</p>
        </div>
        {URL && (
          <div className="text-sm text-muted-foreground underline flex justify-center items-center gap-x-2">
            <Link size={15} />
            <a href={URL}>{URL}</a>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-400 italic">{description}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ backgroundColor: "white", width: "0.6rem", height: "0.6rem" }}
      />
      {/* <Handle
        type="target"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem" }}
      /> */}
    </div>
  );
};

export { NewWindowNode };
