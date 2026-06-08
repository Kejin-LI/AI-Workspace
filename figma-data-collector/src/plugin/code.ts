// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 600 });

// This intercepts all document changes
figma.on('documentchange', (event) => {
  const changes = event.documentChanges.map(change => {
    // Figma nodes can be queried by ID to get their actual JSON representation
    let nodeData = null;
    try {
      const node = figma.getNodeById(change.id);
      if (node) {
        nodeData = {
          name: node.name,
          type: node.type,
          // Extract more properties as needed
        };
      }
    } catch (e) {
      // Node might be deleted
    }

    return {
      type: change.type,
      id: change.id,
      nodeData
    };
  });

  // Send the change to the UI thread
  figma.ui.postMessage({
    type: 'document-changes',
    changes
  });
});

// Listen for messages from the UI (e.g. user sends a message)
figma.ui.onmessage = (msg) => {
  if (msg.type === 'send-context') {
    console.log("Received context from UI:", msg.content);
    // Here you would typically package the context + current state 
    // and send it back to the UI to be pushed to Supabase
  }
};
